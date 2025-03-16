import Bill from "../models/bills.model.js";
import Payment from "../models/payments.model.js";

export const createPayment = async (req, res) => {
  try {
    const error = [];
    console.log(req.body.bills, "req.body.bills");
    for await (const singleBill of req.body.bills) {
      const bill = await Bill.findOne({
        DOC_NO: singleBill.DOC_NO,
        COMP_CD: req.user.COMP_CD,
        CLIENT_CD: req.user.CLIENT_CD,
      });
      // if (bill && bill.PND_AMT >= Number(singleBill.RCV_AMT)) {
      bill.PND_AMT -= Number(singleBill.RCV_AMT);
      singleBill.PND_AMT -= Number(singleBill.RCV_AMT);
      await bill.save();
      // } else {
      //   error.push(singleBill);
      // }
    }
    const payment = await Payment.insertMany(req.body.bills);
    res.status(200).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const dateObj = req.query.date ? new Date(req.query.date) : new Date();
    let fromDate;
    let toDate;

    // Create start of day timestamp for the specified date
    const paymentDate = new Date(
      Date.UTC(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        0,
        0,
        0
      )
    );

    // Create end of day timestamp for the specified date
    const endOfDay = new Date(
      Date.UTC(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate() + 1,
        0,
        0,
        0
      )
    );
    endOfDay.setMilliseconds(-1);

    // Handle from/to date range if provided (keeping original functionality)
    if (req.query.from && req.query.to) {
      const from = new Date(req.query.from);
      const to = new Date(req.query.to);
      if (from > to) {
        return res
          .status(400)
          .json({ message: "To Date should be greater than From Date" });
      }
      fromDate = new Date(
        Date.UTC(from.getFullYear(), from.getMonth(), from.getDate(), 0, 0, 0)
      );
      toDate = new Date(
        Date.UTC(to.getFullYear(), to.getMonth(), to.getDate(), 0, 0, 0)
      );
    }

    // Build base query with company and client codes
    let findQuery = {
      COMP_CD: req.user.COMP_CD,
      CLIENT_CD: req.user.CLIENT_CD,
    };

    // Add agent code if exists
    if (req?.user?.AGENT_CD) {
      findQuery = { ...findQuery, AGENT_CD: req.user.AGENT_CD };
    }

    // Add payment method filter if specified
    if (req.query?.payment_method) {
      findQuery = { ...findQuery, PAYMENT_TYPE: req.query.payment_method };
    }

    // Add party code filter if specified
    if (req.query?.partyCode) {
      findQuery = { ...findQuery, PARTY_CD: req.query.partyCode };
    }

    // Create the date query - either a date range or a single day
    const billDateQuery = {
      BILL_DT:
        fromDate && toDate
          ? {
              $gte: fromDate,
              $lte: toDate,
            }
          : { $eq: paymentDate },
    };

    console.log(findQuery, "findQuery", billDateQuery, req.query?.date);

    const allPayments = await Payment.aggregate([
      {
        $match: {
          ...findQuery,
          ...billDateQuery,
        },
      },
      {
        $sort: {
          DOC_DT: 1,
          DOC_NO: 1,
        },
      },
      {
        $group: {
          _id: "$BILL_NO",
          BILL_DT: { $first: "$BILL_DT" },
          BILL_NO: { $first: "$BILL_NO" },
          PARTY_CD: { $first: "$PARTY_CD" },
          PARTY_NM: { $first: "$PARTY_NM" },
          PAYMENT_TYPE: { $first: "$PAYMENT_TYPE" },
          CHQ_DT: { $first: "$CHQ_DT" },
          TRANSACTION_NO: { $first: "$TRANSACTION_NO" },
          createdAt: { $first: "$createdAt" },
          AGENT_CD: { $first: "$AGENT_CD" },
          COMP_CD: { $first: "$COMP_CD" },
          CLIENT_CD: { $first: "$CLIENT_CD" },
          REMARK: { $first: "$REMARK" },
          TOTAL: { $sum: "$RCV_AMT" },
          BILLS: {
            $push: {
              billPaymentId: "$_id",
              DOC_DT: "$DOC_DT",
              BIL_AMT: "$BIL_AMT",
              PND_AMT: "$PND_AMT",
              RCV_AMT: "$RCV_AMT",
              DOC_NO: "$DOC_NO",
            },
          },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          BILL_DT: 1,
          BILL_NO: 1,
          PARTY_CD: 1,
          PARTY_NM: 1,
          PAYMENT_TYPE: 1,
          CHQ_DT: 1,
          TRANSACTION_NO: 1,
          AGENT_CD: 1,
          REMARK: 1,
          TOTAL: 1,
          BILLS: 1,
        },
      },
      {
        $group: {
          _id: null,
          TOTAL_PAYMENT_TYPE_RCV_AMT: { $sum: "$TOTAL" },
          PAYMENTS: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          _id: 0,
          TOTAL_PAYMENT_TYPE_RCV_AMT: 1,
          PAYMENTS: 1,
        },
      },
    ]);

    res.status(200).json(allPayments);
  } catch (error) {
    console.log(error, "Errrror");
    res.status(400).json({ message: error.message });
  }
};

export const getPaymentsCSV = async (req, res) => {
  try {
    // Get the date from query parameter or use current date as default
    const dateObj = req.query.date ? new Date(req.query.date) : new Date();
    const paymentDate = new Date(
      Date.UTC(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        0,
        0,
        0
      )
    );

    // Get start and end dates from query parameters if provided
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build the base query
    let findQuery = {
      COMP_CD: req.query.COMP_CD,
      CLIENT_CD: req.query.CLIENT_CD,
    };

    // Add agent code if provided
    if (req?.query?.AGENT_CD) {
      findQuery = { ...findQuery, AGENT_CD: req.query.AGENT_CD };
    }

    // Build the date filter based on provided parameters
    let dateFilter = {};

    if (startDate && endDate) {
      // If both start and end dates are provided
      dateFilter = {
        $gte: startDate,
        $lte: endDate,
      };
    } else if (startDate) {
      // If only start date is provided
      dateFilter = {
        $gte: startDate,
      };
    } else if (endDate) {
      // If only end date is provided
      dateFilter = {
        $lte: endDate,
      };
    } else {
      // If neither start nor end date is provided, use the original date filter
      dateFilter = {
        $eq: paymentDate,
      };
    }

    // Add the date filter to the query
    findQuery.BILL_DT = dateFilter;

    console.log(findQuery, "findQuery");

    // Find payments with the constructed query
    const allPayments = await Payment.find(findQuery);
    const payments = JSON.parse(JSON.stringify(allPayments));

    if (payments.length == 0) {
      res.status(200);
      return res.json({ message: "No Payments Found" });
    }

    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(payments[0]);
    const csv = [
      header.join(","), // header row first
      ...payments.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(",")
      ),
    ].join("\r\n");

    res.header("Content-Type", "text/csv");
    res.attachment("payments.csv");
    return res.send(csv);
  } catch (err) {
    console.log(err, "Error==");
    res.status(400);
    return res.json({ message: "Error generating CSV" });
  }
};
