import {
  FETCH_MESSAGES,
  FETCH_MESSAGES_SUCCESS,
  FETCH_MESSAGES_FAILED,
  SEND_MESSAGE,
  STOP_FETCH_MESSAGES,
  UPDATE_MESSAGES_TO_READ,
} from "../store/types";
import store from "../store/store";
import { RequestPushMsg } from "../other/NotificationFunctions";

export const fetchChatMessages = (bookingId) => (dispatch) => (firebase) => {
  const { chatRef } = firebase;

  dispatch({
    type: FETCH_MESSAGES,
    payload: bookingId,
  });
  chatRef(bookingId).on("value", (snapshot) => {
    if (snapshot.val()) {
      let rootEntry = snapshot.val();
      let allMesseges = [];
      for (let key in rootEntry) {
        let entryKey = rootEntry[key];
        for (let msgKey in entryKey) {
          entryKey[msgKey].smsId = msgKey;
          allMesseges.push(entryKey[msgKey]);
        }
      }
      dispatch({
        type: FETCH_MESSAGES_SUCCESS,
        payload: allMesseges,
      });
    } else {
      dispatch({
        type: FETCH_MESSAGES_FAILED,
        payload: store.getState().languagedata.defaultLanguage.chat_not_found,
      });
    }
  });
};

export const updateMessagesToRead = (data) => (dispatch) => (firebase) => {
  const { curBooking, role } = data;
  const { chatRef } = firebase;
  const chatId = curBooking.customer + "," + curBooking.driver;

  chatRef(curBooking.id)
    .child(chatId)
    .once("value", (querySnapshot) => {
      querySnapshot.forEach(function (doc) {
        const source = doc.val().source;
        if (source !== role) {
          doc.ref.update({
            unread: false,
          });
        }
      });
    });
  dispatch({
    type: UPDATE_MESSAGES_TO_READ,
    payload: curBooking,
  });
};

export const sendMessage = (data) => (dispatch) => (firebase) => {
  const { chatRef } = firebase;

  const chatId = data.booking.customer + "," + data.booking.driver;
  var today = new Date();
  var time = today.getHours() + ":" + today.getMinutes();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + ":" + dd + ":" + yyyy;

  const msg = {
    message: data.message,
    from: data.role == "rider" ? data.booking.customer : data.booking.driver,
    type: "msg",
    msgDate: today,
    msgTime: time,
    source: data.role,
    sentOn: today,
    unread: true,
  };

  chatRef(data.booking.id).child(chatId).push(msg);
  if (data.role == "rider") {
    RequestPushMsg(data.booking.driver_token, {
      title:
        store.getState().languagedata.defaultLanguage.notification_title +
        store.getState().languagedata.defaultLanguage.chat_requested,
      msg: data.message,
      screen: "onlineChat",
      params: { bookingId: data.booking.id },
    })(firebase);
  } else {
    RequestPushMsg(data.booking.customer_token, {
      title:
        store.getState().languagedata.defaultLanguage.notification_title +
        store.getState().languagedata.defaultLanguage.chat_requested,
      msg: data.message,
      screen: "onlineChat",
      params: { bookingId: data.booking.id },
    })(firebase);
  }

  dispatch({
    type: SEND_MESSAGE,
    payload: msg,
  });
};

export const stopFetchMessages = (bookingId) => (dispatch) => (firebase) => {
  const { chatRef } = firebase;

  dispatch({
    type: STOP_FETCH_MESSAGES,
    payload: bookingId,
  });
  chatRef(bookingId).off();
};
