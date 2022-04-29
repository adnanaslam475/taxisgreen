import React, { useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Modal,
  Alert,
} from "react-native";
import { Header } from "react-native-elements";
import { colors } from "../common/theme";
var { width, height } = Dimensions.get("window");
import { PromoComp } from "../components";
import i18n from "i18n-js";
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from "common/src";

export default function PaymentDetails(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const { updateBooking, updateWalletBalance, cancelBooking, editPromo } = api;
  const dispatch = useDispatch();
  const userdata = useSelector((state) => state.auth.info.profile);
  const settings = useSelector((state) => state.settingsdata.settings);
  const providers = useSelector((state) => state.paymentmethods.providers);

  const booking = props.navigation.getParam("booking");

  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const [payDetails, setPayDetails] = useState({
    amount: booking.trip_cost,
    discount: booking.discount ? booking.discount : 0,
    usedWalletMoney: booking.usedWalletMoney ? booking.usedWalletMoney : 0,
    promo_applied: booking.promo_applied ? booking.promo_applied : false,
    promo_details: booking.promo_details ? booking.promo_details : null,
    payableAmount: booking.payableAmount
      ? booking.payableAmount
      : booking.trip_cost,
  });

  const doPayment = (payment_mode) => {
    if (payment_mode == "cash") {
      let curBooking = { ...booking };
      if (booking.status == "PAYMENT_PENDING") {
        curBooking.status = "NEW";
      } else {
        curBooking.status = "PAID";
      }
      curBooking.payment_mode = payment_mode;
      curBooking.customer_paid = parseFloat(payDetails.amount).toFixed(
        settings.decimal
      );

      curBooking.cardPaymentAmount = 0;
      curBooking.cashPaymentAmount = parseFloat(payDetails.amount).toFixed(
        settings.decimal
      );
      curBooking.payableAmount = parseFloat(payDetails.payableAmount).toFixed(
        settings.decimal
      );
      curBooking.promo_applied = payDetails.promo_applied;
      curBooking.promo_details = payDetails.promo_details;
      dispatch(updateBooking(curBooking));

      if (userdata.usertype == "rider") {
        if (curBooking.status == "NEW") {
          props.navigation.navigate("BookedCab", { bookingId: booking.id });
        } else {
          props.navigation.navigate("DriverRating", { bookingId: booking.id });
        }
      } else {
        props.navigation.navigate("DriverTrips");
      }
    } else {
      let curBooking = { ...booking };
      if (userdata.usertype == "driver") {
        if (booking.status != "PAYMENT_PENDING") {
          curBooking.status = "PENDING";
        }
        dispatch(updateBooking(curBooking));

        let payData = {
          first_name: userdata.firstName,
          last_name: userdata.lastName,
          email: userdata.email,
          email: userdata.email,
          amount: payDetails.payableAmount,
          order_id: booking.id,
          name: t("bookingPayment"),
          description: t("order_id") + booking.id,
          currency: settings.code,
          quantity: 1,
        };

        const paymentPacket = {
          appcat: appcat,
          payment_mode: payment_mode,
          customer_paid: parseFloat(payDetails.amount).toFixed(
            settings.decimal
          ),
          discount_amount: parseFloat(payDetails.discount).toFixed(
            settings.decimal
          ),
          usedWalletMoney: parseFloat(payDetails.usedWalletMoney).toFixed(
            settings.decimal
          ),
          cardPaymentAmount: parseFloat(payDetails.payableAmount).toFixed(
            settings.decimal
          ),
          cashPaymentAmount: 0,
          payableAmount: parseFloat(payDetails.payableAmount).toFixed(
            settings.decimal
          ),
          promo_applied: payDetails.promo_applied,
          promo_details: payDetails.promo_details,
        };

        curBooking.paymentPacket = paymentPacket;
        dispatch(updateBooking(curBooking));
      }
    }
  };

  // props.navigation.navigate("DriverTrips");
  const cancelCurBooking = () => {
    Alert.alert(t("alert"), t("cancel_confirm"), [
      { text: t("cancel"), onPress: () => {}, style: "cancel" },
      {
        text: t("ok"),
        onPress: () => {
          payDetails.promo_applied ? removePromo() : null;
          dispatch(
            cancelBooking({
              booking: booking,
              reason: t("cancelled_incomplete_booking"),
              cancelledBy: userdata.usertype,
            })
          );
          props.navigation.navigate("Map");
        },
      },
    ]);
  };

  const lCom = {
    icon: "md-menu",
    type: "ionicon",
    color: colors.WHITE,
    size: 30,
    component: TouchableWithoutFeedback,
    onPress: () => {
      props.navigation?.toggleDrawer();
    },
  };
  const rCom =
    userdata &&
    userdata.usertype == "rider" &&
    booking.status == "PAYMENT_PENDING" ? (
      <TouchableOpacity onPress={cancelCurBooking}>
        <Text style={{ color: colors.WHITE }}>{t("cancel")}</Text>
      </TouchableOpacity>
    ) : null;

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.HEADER}
        leftComponent={isRTL ? rCom : lCom}
        centerComponent={
          <Text style={styles.headerTitleStyle}>{t("payment")}</Text>
        }
        rightComponent={isRTL ? lCom : rCom}
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollStyle}
      >
        <View style={{ flex: 1, flexDirection: "column" }}>
          <View
            style={{
              flex: 1,
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-between",
              paddingLeft: 20,
              paddingRight: 20,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                color: colors.BLACK,
                textAlign: isRTL ? "right" : "left",
                lineHeight: 45,
                fontSize: 22,
                fontWeight: "500",
              }}
            >
              {t("bill_details")}
            </Text>
          </View>
          {userdata && userdata.usertype == "driver" ? (
            <View style={{ flex: 1, paddingLeft: 25, paddingRight: 25 }}>
              <View
                style={[
                  styles.location,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                {booking && booking.trip_start_time ? (
                  <View>
                    <Text
                      style={[
                        styles.timeStyle,
                        { textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {booking.trip_start_time}
                    </Text>
                  </View>
                ) : null}
                {booking && booking.pickup ? (
                  <View
                    style={[
                      styles.address,
                      isRTL
                        ? { flexDirection: "row-reverse", marginRight: 6 }
                        : { flexDirection: "row", marginLeft: 6 },
                    ]}
                  >
                    <View style={styles.greenDot} />
                    <Text
                      style={[
                        styles.adressStyle,
                        isRTL
                          ? { marginRight: 6, textAlign: "right" }
                          : { marginLeft: 6, textAlign: "left" },
                      ]}
                    >
                      {booking.pickup.add}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View
                style={[
                  styles.location,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                {booking && booking.trip_end_time ? (
                  <View>
                    <Text
                      style={[
                        styles.timeStyle,
                        { textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      {booking.trip_end_time}
                    </Text>
                  </View>
                ) : null}
                {booking && booking.drop ? (
                  <View
                    style={[
                      styles.address,
                      isRTL
                        ? { flexDirection: "row-reverse", marginRight: 6 }
                        : { flexDirection: "row", marginLeft: 6 },
                    ]}
                  >
                    <View style={styles.redDot} />
                    <Text
                      style={[
                        styles.adressStyle,
                        isRTL
                          ? { marginRight: 6, textAlign: "right" }
                          : { marginLeft: 6, textAlign: "left" },
                      ]}
                    >
                      {booking.drop.add}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          {userdata && userdata.usertype == "driver" ? (
            <View
              style={{
                flex: 1,
                flexDirection: isRTL ? "row-reverse" : "row",
                justifyContent: "space-between",
                paddingLeft: 25,
                paddingRight: 25,
              }}
            >
              <Text
                style={{
                  color: colors.BLACK,
                  textAlign: isRTL ? "right" : "left",
                  lineHeight: 45,
                  fontSize: 16,
                }}
              >
                {t("distance")}
              </Text>
              <Text
                style={{
                  color: colors.BLACK,
                  textAlign: isRTL ? "right" : "left",
                  lineHeight: 45,
                  fontSize: 16,
                }}
              >
                {(booking && booking.distance ? booking.distance : "0") +
                  " " +
                  (settings && settings.convert_to_mile ? t("mile") : t("km"))}
              </Text>
            </View>
          ) : null}
          {userdata && userdata.usertype == "driver" ? (
            <View
              style={{
                flex: 1,
                flexDirection: isRTL ? "row-reverse" : "row",
                justifyContent: "space-between",
                paddingLeft: 25,
                paddingRight: 25,
              }}
            >
              <Text
                style={{
                  color: colors.BLACK,
                  textAlign: isRTL ? "right" : "left",
                  lineHeight: 45,
                  fontSize: 16,
                }}
              >
                {t("total_time")}
              </Text>
              <Text
                style={{
                  color: colors.BLACK,
                  textAlign: isRTL ? "right" : "left",
                  lineHeight: 45,
                  fontSize: 16,
                }}
              >
                {(booking && booking.total_trip_time
                  ? parseFloat(booking.total_trip_time / 60).toFixed(1)
                  : "0") +
                  " " +
                  t("mins")}
              </Text>
            </View>
          ) : null}
          {userdata && userdata.usertype == "driver" ? (
            <View
              style={{
                borderStyle: "dotted",
                borderWidth: 0.5,
                borderRadius: 1,
                marginBottom: 20,
              }}
            ></View>
          ) : null}

          {userdata ? (
            <View
              style={{
                flex: 1,
                flexDirection: isRTL ? "row-reverse" : "row",
                justifyContent: "space-between",
                paddingLeft: 25,
                paddingRight: 25,
              }}
            >
              <Text
                style={{
                  color: colors.BLACK,
                  textAlign: isRTL ? "right" : "left",
                  lineHeight: 45,
                  fontSize: 16,
                }}
              >
                {userdata.usertype == "rider"
                  ? t("your_fare")
                  : t("total_fare")}
              </Text>
              {settings.swipe_symbol === false ? (
                <Text
                  style={{
                    color: colors.BLACK,
                    textAlign: isRTL ? "right" : "left",
                    lineHeight: 45,
                    fontSize: 16,
                  }}
                >
                  {settings.symbol}{" "}
                  {parseFloat(payDetails.amount).toFixed(settings.decimal)}
                </Text>
              ) : (
                <Text
                  style={{
                    color: colors.BLACK,
                    textAlign: isRTL ? "right" : "left",
                    lineHeight: 45,
                    fontSize: 16,
                  }}
                >
                  {parseFloat(payDetails.amount).toFixed(settings.decimal)}{" "}
                  {settings.symbol}
                </Text>
              )}
            </View>
          ) : null}

          {userdata ? (
            <View
              style={{
                borderStyle: "dotted",
                borderWidth: 0.5,
                borderRadius: 1,
              }}
            ></View>
          ) : null}
          {userdata ? (
            <View
              style={{
                flex: 1,
                flexDirection: isRTL ? "row-reverse" : "row",
                justifyContent: "space-between",
                paddingLeft: 25,
                paddingRight: 25,
              }}
            >
              <Text
                style={{
                  color: colors.START_TRIP,
                  textAlign: isRTL ? "right" : "left",
                  lineHeight: 45,
                  fontSize: 24,
                  fontWeight: "500",
                }}
              >
                {t("payable_ammount")}
              </Text>
              {settings.swipe_symbol === false ? (
                <Text
                  style={{
                    color: colors.START_TRIP,
                    textAlign: isRTL ? "right" : "left",
                    lineHeight: 45,
                    fontSize: 24,
                    fontWeight: "bold",
                  }}
                >
                  {settings.symbol}{" "}
                  {payDetails.payableAmount
                    ? parseFloat(payDetails.payableAmount).toFixed(
                        settings.decimal
                      )
                    : 0.0}
                </Text>
              ) : (
                <Text
                  style={{
                    color: colors.START_TRIP,
                    textAlign: isRTL ? "right" : "left",
                    lineHeight: 45,
                    fontSize: 24,
                    fontWeight: "bold",
                  }}
                >
                  {payDetails.payableAmount
                    ? parseFloat(payDetails.payableAmount).toFixed(
                        settings.decimal
                      )
                    : 0.0}{" "}
                  {settings.symbol}
                </Text>
              )}
            </View>
          ) : null}
        </View>
        {/* {payDetails.payableAmount > 0 ? (
          <View
            style={[
              styles.buttonContainer,
              { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
          >
            <TouchableOpacity
              style={styles.buttonWrapper}
              onPress={() => {
                doPayment("cash");
              }}
            >
              <Text style={styles.buttonTitle}>
                {booking.status == "PAYMENT_PENDING"
                  ? t("cash_on_delivery")
                  : t("pay_cash")}
              </Text>
            </TouchableOpacity>
            {providers && providers.length > 0 ? (
              <TouchableOpacity
                style={styles.cardPayBtn}
                onPress={() => {
                  doPayment("card");
                }}
              >
                <Text style={styles.buttonTitle}>
                  {userdata && userdata.usertype == "rider"
                    ? t("payWithCard")
                    : t("request_payment")}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null} */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
    //marginTop: StatusBar.currentHeight
  },
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
  },
  scrollStyle: {
    flex: 1,
    height: height,
    backgroundColor: colors.WHITE,
  },
  container: {
    flex: 1,
    marginTop: 5,
    backgroundColor: "white",
  },
  buttonContainer: {
    width: "100%",
    //position: 'absolute',
    //bottom: 10
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  buttonWrapper: {
    marginHorizontal: 6,
    //marginBottom: 15,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.BUTTON_BACKGROUND,
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  cardPayBtn: {
    marginHorizontal: 6,
    //marginBottom: 15,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.PAYMENT_BUTTON_BLUE,
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  buttonWrapper2: {
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 10,
    marginTop: 20,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.BUTTON_BACKGROUND,
    borderRadius: 8,
    width: "90%",
  },
  buttonTitle: {
    color: colors.WHITE,
    fontSize: 18,
  },
  newname: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  emailInputContainer: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 10,
    backgroundColor: colors.WHITE,
    paddingRight: 10,
    paddingTop: 10,
    width: width - 80,
  },
  errorMessageStyle: {
    fontSize: 15,
    fontWeight: "bold",
  },
  inputTextStyle: {
    color: colors.BLACK,
    fontSize: 16,
  },
  pinbuttonStyle: {
    elevation: 0,
    bottom: 15,
    width: "80%",
    alignSelf: "center",
    borderRadius: 20,
    borderColor: "transparent",
    backgroundColor: colors.BUTTON_RIGHT,
  },
  pinbuttonContainer: { flex: 1, justifyContent: "center" },
  inputContainer: { flex: 3, justifyContent: "center", marginTop: 40 },
  pinheaderContainer: {
    height: 250,
    backgroundColor: colors.WHITE,
    width: "80%",
    justifyContent: "space-evenly",
  },
  pinheaderStyle: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.HEADER,
    justifyContent: "center",
  },
  forgotPassText: {
    textAlign: "center",
    color: colors.WHITE,
    fontSize: 20,
    width: "100%",
  },
  pinContainer: { flexDirection: "row", justifyContent: "space-between" },
  forgotStyle: { flex: 3, justifyContent: "center", alignItems: "center" },
  crossIconContainer: { flex: 1, left: "40%" },
  forgot: { flex: 1 },
  pinbuttonTitle: {
    fontWeight: "bold",
    fontSize: 18,
    width: "100%",
    textAlign: "center",
  },
  newname2: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  emailInputContainer2: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingLeft: 10,
    backgroundColor: colors.WHITE,
    paddingRight: 10,
    paddingTop: 10,
    width: width - 80,
  },

  inputTextStyle2: {
    color: colors.BLACK,
    fontSize: 14,
  },
  buttonStyle2: {
    elevation: 0,
    bottom: 15,
    width: "80%",
    alignSelf: "center",
    borderRadius: 20,
    borderColor: "transparent",
    backgroundColor: colors.BUTTON_RIGHT,
  },
  buttonContainer2: { flex: 1, justifyContent: "center", marginTop: 5 },
  inputContainer2: { flex: 4, paddingBottom: 25 },
  headerContainer2: {
    height: 380,
    backgroundColor: colors.WHITE,
    width: "80%",
    justifyContent: "center",
  },
  headerStyle2: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.HEADER,
    justifyContent: "center",
  },
  forgotPassText2: {
    textAlign: "center",
    color: colors.WHITE,
    fontSize: 16,
    width: "100%",
  },
  forgotContainer2: { flexDirection: "row", justifyContent: "space-between" },
  forgotStyle2: { flex: 3, justifyContent: "center" },
  crossIconContainer2: { flex: 1, left: "40%" },
  forgot2: { flex: 1 },
  buttonTitle2: {
    fontWeight: "bold",
    fontSize: 16,
    width: "100%",
    textAlign: "center",
  },

  containercvv: {
    flex: 1,
    width: "100%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingTop: 120,
  },
  modalContainercvv: {
    height: 200,
    backgroundColor: colors.WHITE,
    width: "80%",
    borderRadius: 10,
    elevation: 15,
  },
  crossIconContainercvv: {
    flex: 1,
    left: "40%",
  },
  blankViewStylecvv: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: 15,
    marginRight: 15,
  },
  blankViewStyleOTP: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "flex-end",
  },
  modalHeaderStylecvv: {
    textAlign: "center",
    fontSize: 20,
    paddingTop: 10,
  },
  modalContainerViewStylecvv: {
    flex: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  itemsViewStylecvv: {
    flexDirection: "column",
    // justifyContent: "space-between"
  },
  textStylecvv: {
    fontSize: 20,
  },
  location: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 6,
  },
  timeStyle: {
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    marginTop: 1,
  },
  greenDot: {
    backgroundColor: colors.GREEN_DOT,
    width: 10,
    height: 10,
    borderRadius: 50,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  redDot: {
    backgroundColor: colors.RED,
    width: 10,
    height: 10,
    borderRadius: 50,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  address: {
    flexDirection: "row",
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: 0,
    marginLeft: 6,
  },
  adressStyle: {
    marginLeft: 6,
    fontSize: 15,
    lineHeight: 20,
  },
});
