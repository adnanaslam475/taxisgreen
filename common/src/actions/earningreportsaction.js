import {
  FETCH_BOOKING_DISCOUNT,
  FETCH_BOOKING__DISCOUNT_SUCCESS,
  FETCH_BOOKING__DISCOUNT_FAILED,
} from "../store/types";

export const fetchEarningsReport = () => (dispatch) => async (firebase) => {

  const {
    bookingRef,
    settingsRef
  } = firebase;

  dispatch({
    type: FETCH_BOOKING_DISCOUNT,
    payload: null
  });

  const settingsdata = await settingsRef.once("value");
  const settings = settingsdata.val();

  bookingRef.on("value", snapshot => {
    if (snapshot.val()) {
      const mainArr = snapshot.val();
      var monthsName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var renderobj = {};
      Object.keys(mainArr).map(j => {
        if ((mainArr[j].status === 'PAID' || mainArr[j].status === 'COMPLETE') && mainArr[j].discount_amount !== undefined && mainArr[j].driver_share !== undefined && mainArr[j].customer_paid !== undefined && mainArr[j].convenience_fees !== undefined && mainArr[j].trip_cost !== undefined) {

          let bdt = new Date(mainArr[j].tripdate);
          let uniqueKey = bdt.getFullYear() + '_' + bdt.getMonth();
          if (renderobj[uniqueKey]) {
            renderobj[uniqueKey].discountAmount = (parseFloat(renderobj[uniqueKey].discountAmount) + parseFloat(mainArr[j].discount_amount)).toFixed(settings.decimal);
            renderobj[uniqueKey].driverShare = (parseFloat(renderobj[uniqueKey].driverShare) + parseFloat(mainArr[j].driver_share)).toFixed(settings.decimal);
            renderobj[uniqueKey].customerPaid = (parseFloat(renderobj[uniqueKey].customerPaid) + parseFloat(mainArr[j].customer_paid)).toFixed(settings.decimal);
            renderobj[uniqueKey].convenienceFee = (parseFloat(renderobj[uniqueKey].convenienceFee) + parseFloat(mainArr[j].convenience_fees)).toFixed(settings.decimal);
            renderobj[uniqueKey].tripCost = (parseFloat(renderobj[uniqueKey].tripCost) + parseFloat(mainArr[j].trip_cost)).toFixed(settings.decimal);
            renderobj[uniqueKey]['total_rides'] = renderobj[uniqueKey]['total_rides'] + 1;
          } else {
            renderobj[uniqueKey] = {};
            renderobj[uniqueKey]['dated'] = mainArr[j].tripdate;
            renderobj[uniqueKey]['year'] = bdt.getFullYear();
            renderobj[uniqueKey]['month'] = bdt.getMonth();
            renderobj[uniqueKey]['monthsName'] = monthsName[bdt.getMonth()];
            renderobj[uniqueKey]['discountAmount'] = parseFloat(mainArr[j].discount_amount).toFixed(settings.decimal);
            renderobj[uniqueKey]['driverShare'] = parseFloat(mainArr[j].driver_share).toFixed(settings.decimal);
            renderobj[uniqueKey]['customerPaid'] = parseFloat(mainArr[j].customer_paid).toFixed(settings.decimal);
            renderobj[uniqueKey]['convenienceFee'] = parseFloat(mainArr[j].convenience_fees).toFixed(settings.decimal);
            renderobj[uniqueKey]['uniqueKey'] = uniqueKey;
            renderobj[uniqueKey]['tripCost'] = parseFloat(mainArr[j].trip_cost).toFixed(settings.decimal);
            renderobj[uniqueKey]['total_rides'] = 1;
          }
        }
        return null;
      });
      if (renderobj) {
        const arr = Object.keys(renderobj).map(i => {
          renderobj[i].myEarning = (parseFloat(renderobj[i].customerPaid) - parseFloat(renderobj[i].driverShare)).toFixed(settings.decimal);
          renderobj[i].customerPaid = parseFloat(renderobj[i].customerPaid).toFixed(settings.decimal);
          renderobj[i].rideCost = (parseFloat(renderobj[i].tripCost) - parseFloat(renderobj[i].convenienceFee)).toFixed(settings.decimal);
          renderobj[i].driverShare = parseFloat(renderobj[i].driverShare).toFixed(settings.decimal);
          return renderobj[i]
        })
        dispatch({
          type: FETCH_BOOKING__DISCOUNT_SUCCESS,
          payload: arr
        });
      }

    } else {
      dispatch({
        type: FETCH_BOOKING__DISCOUNT_FAILED,
        payload: "No data available."
      });
    }
  });
};

