var CronJob = require("cron").CronJob;
var mailer = require("./mailer");
var moment = require("moment");

var enumerateDaysBetweenDates = (startDate, endDate) => {
  var dates = [];
  dates.push({
    fdate: moment().format("YYYY-MM-DD"),
    tdate: moment().format("YYYY-MM-DD"),
  });
  dates.push({
    fdate: moment(startDate).format("YYYY-MM-DD"),
    tdate: moment(endDate).format("YYYY-MM-DD"),
  });
  let mm = moment().month() + 1;
  let month = mm < 10 ? "0" + mm : mm;
  dates.push({
    fdate: moment().year() + "-" + month + "-01",
    tdate: moment().year() + "-" + month + "-31",
  });
  return dates;
};

exports.start = async () => {
  console.log("Cron job init start");
  const dailyJob = new CronJob(
    "00 00 * * *",
    function () {
      let from_date = "2021-01-01";
      let to_date = "2021-01-01";
      let dateData = {
        from_date: moment()
          .day("Sunday")
          .year(moment().year())
          .week(moment().week())
          .format("YYYY-MM-DD"),
        to_date: moment()
          .day("Saturday")
          .year(moment().year())
          .week(moment().week())
          .format("YYYY-MM-DD"),
      };
      let dates = enumerateDaysBetweenDates(
        dateData.from_date,
        dateData.to_date
      );
      if (dates.length > 0) {
        from_date = dates[0].fdate;
        to_date = dates[0].tdate;
      }
    },
    null,
    true,
    "Asia/Kolkata"
  ).start();

  const weekJob = new CronJob(
    "00 01 * * 1",
    function () {
      let from_date = "2021-01-01";
      let to_date = "2021-01-01";
      let dateData = {
        from_date: moment()
          .day("Sunday")
          .year(moment().year())
          .week(moment().week())
          .format("YYYY-MM-DD"),
        to_date: moment()
          .day("Saturday")
          .year(moment().year())
          .week(moment().week())
          .format("YYYY-MM-DD"),
      };
      let dates = enumerateDaysBetweenDates(
        dateData.from_date,
        dateData.to_date
      );
      if (dates.length > 0) {
        from_date = dates[1].fdate;
        to_date = dates[1].tdate;
      }
    },
    null,
    true,
    "Asia/Kolkata"
  ).start();

  const monthJob = new CronJob(
    "00 02 1 * *",
    function () {
      let from_date = "2021-01-01";
      let to_date = "2021-01-01";
      let dateData = {
        from_date: moment()
          .day("Sunday")
          .year(moment().year())
          .week(moment().week())
          .format("YYYY-MM-DD"),
        to_date: moment()
          .day("Saturday")
          .year(moment().year())
          .week(moment().week())
          .format("YYYY-MM-DD"),
      };
      let dates = enumerateDaysBetweenDates(
        dateData.from_date,
        dateData.to_date
      );
      if (dates.length > 0) {
        from_date = dates[2].fdate;
        to_date = dates[2].tdate;
      }
    },
    null,
    true,
    "Asia/Kolkata"
  ).start();
};
