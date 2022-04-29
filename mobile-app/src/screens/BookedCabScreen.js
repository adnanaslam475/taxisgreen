import React, { useState, useEffect, useRef, useContext } from "react";
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Linking,
  Alert,
  Share,
  TextInput,
} from "react-native";
import { TouchableOpacity as OldTouch } from "react-native";
import { Icon, Button, Header } from "react-native-elements";
import * as Location from "expo-location";

import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  AnimatedRegion,
} from "react-native-maps";
import { OtpModal } from "../components";
import StarRating from "react-native-star-rating";
import RadioForm from "react-native-simple-radio-button";
import { colors } from "../common/theme";
var { width, height } = Dimensions.get("window");
import i18n from "i18n-js";
import { useSelector, useDispatch } from "react-redux";
import { NavigationEvents } from "react-navigation";
import Polyline from "@mapbox/polyline";
import getDirections from "react-native-google-maps-directions";
import carImageIcon from "../../assets/images/track_Car.png";
import { FirebaseContext } from "common/src";
import * as ImagePicker from "expo-image-picker";
import moment from "moment/min/moment-with-locales";
import CancelModal from "../components/CancelModal";

export default function BookedCabScreen(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const {
    fetchBookingLocations,
    stopLocationFetch,
    updateBookingImage,
    cancelBooking,
    updateBooking,
    getRouteDetails,
  } = api;
  const dispatch = useDispatch();
  const bookingId = props.navigation.getParam("bookingId");
  const setBookLaterModalStatus = props.navigation.getParam(
    "setBookLaterModalStatus"
  );
  const latitudeDelta = 0.0922;
  const longitudeDelta = 0.0421;
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const activeBookings = useSelector((state) => state.bookinglistdata.active);
  const [curBooking, setCurBooking] = useState(null);
  const cancelReasons = useSelector((state) => state.cancelreasondata.complex);
  const role = useSelector((state) => state.auth.info.profile.usertype);
  const [cancelReasonSelected, setCancelReasonSelected] = useState(0);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const lastLocation = useSelector((state) => state.locationdata.coords);
  const [liveRouteCoords, setLiveRouteCoords] = useState(null);
  const mapRef = useRef();
  const pageActive = useRef(false);
  const [lastCoords, setlastCoords] = useState();
  const [arrivalTime, setArrivalTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [purchaseInfoModalStatus, setPurchaseInfoModalStatus] = useState(false);
  const [userInfoModalStatus, setUserInfoModalStatus] = useState(false);
  const settings = useSelector((state) => state.settingsdata.settings);
  const allChat = useSelector((state) => state.chatdata.messages);

  const [shouldVisible, setShouldVisible] = useState(true);
  const cars = useSelector((state) => state.cartypes.cars);
  const [trip_cost, setTripCost] = useState(0);
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const {
    fetchChatMessages,
    stopFetchMessages,
    // sendMessage,
    // updateMessagesToRead,
  } = api;
  const [hasUnreadMessages, setHasUnreadMessages] = React.useState(false);

  useEffect(() => {
    // allChat.sort(function (a, b) {
    //   return b.time > a.time;
    // });
    if (allChat && allChat.length > 0) {
      const hasunread = allChat.filter(
        (item) => item.unread === true && item.source !== role
      );
      setHasUnreadMessages(hasunread.length > 0);
    }
  }, [allChat]);
  const deductMoneyFromCard = async () => {
    try {
      const bodyTxt = `amount=${trip_cost * 100}&currency=${
        settings.code
      }&error_on_requires_action=true&confirm=true&customer=${
        curBooking.customer_stripe_customer_id
      }&payment_method=${
        curBooking.paymentMethodModalId
      }&payment_method_types[0]=card`;

      const response = await fetch(
        "https://api.stripe.com/v1/payment_intents",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer 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",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: bodyTxt,
        }
      );
      const data = await response.text();
    } catch (err) {
      console.log(err);
    }
  };

  const doPayment = async (payment_mode) => {
    if (curBooking) {
      if (payment_mode == "cash") {
        curBooking.payment_mode = payment_mode;
        curBooking.customer_paid = trip_cost;

        curBooking.cardPaymentAmount = 0;
        curBooking.cashPaymentAmount = trip_cost;
        curBooking.payableAmount = trip_cost;
        curBooking.promo_applied = false;
        curBooking.promo_details = null;
        curBooking.trip_cost = trip_cost;
        let rates = {};
        for (var i = 0; i < cars.length; i++) {
          if (cars[i].name == curBooking.carType) {
            rates = cars[i];
          }
        }
        let convenienceFee = 0;
        if (
          rates.convenience_fee_type &&
          rates.convenience_fee_type == "flat"
        ) {
          convenienceFee = rates.convenience_fees;
        } else {
          convenienceFee =
            (trip_cost * parseFloat(rates.convenience_fees)) / 100;
        }
        curBooking.convenience_fees = convenienceFee;
        curBooking.driver_share = trip_cost - convenienceFee;
        curBooking.trip_cost = trip_cost;
        curBooking.status = "PAID";
        dispatch(updateBooking(curBooking));

        props.navigation.navigate("DriverTrips");
      } else {
        if (role == "driver") {
          await deductMoneyFromCard();
          curBooking.payment_mode = payment_mode;
          curBooking.customer_paid = trip_cost;

          curBooking.cashPaymentAmount = 0;
          curBooking.cardPaymentAmount = trip_cost;
          curBooking.payableAmount = trip_cost;
          curBooking.promo_applied = false;
          curBooking.promo_details = null;
          curBooking.status = "PAID";
          curBooking.trip_cost = trip_cost;
          let rates = {};
          for (var i = 0; i < cars.length; i++) {
            if (cars[i].name == curBooking.carType) {
              rates = cars[i];
            }
          }
          let convenienceFee = 0;
          if (
            rates.convenience_fee_type &&
            rates.convenience_fee_type == "flat"
          ) {
            convenienceFee = rates.convenience_fees;
          } else {
            convenienceFee =
              (trip_cost * parseFloat(rates.convenience_fees)) / 100;
          }
          curBooking.convenience_fees = convenienceFee;
          curBooking.driver_share = trip_cost - convenienceFee;

          dispatch(updateBooking(curBooking));

          props.navigation.navigate("DriverTrips");
        }
      }
    }
  };
  useEffect(() => {
    setInterval(() => {
      if (
        pageActive.current &&
        curBooking &&
        lastLocation &&
        (curBooking.status == "ACCEPTED" || curBooking.status == "STARTED")
      ) {
        if (
          lastCoords &&
          lastCoords.lat != lastLocation.lat &&
          lastCoords.lat != lastLocation.lng
        ) {
          if (curBooking.status == "ACCEPTED") {
            let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
            let point2 = {
              lat: curBooking.pickup.lat,
              lng: curBooking.pickup.lng,
            };
            fitMap(point1, point2);
          } else {
            let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
            let point2 = { lat: curBooking.drop.lat, lng: curBooking.drop.lng };
            fitMap(point1, point2);
          }
          setlastCoords(lastLocation);
        }
      }
    }, 20000);
  }, []);

  const [counter, setCounter] = React.useState(180);
  function fmtMSS(s) {
    return (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + s;
  }

  React.useEffect(() => {
    let timer;
    if (curBooking && curBooking.status == "ARRIVED") {
      timer = setInterval(() => {
        if (counter == 0) {
          clearInterval(timer);
        }
        setCounter((prevCount) => prevCount - 1); // <-- Change this line!
      }, 1000);
    } else if (curBooking && curBooking.status == "CUSTOMER_ON_BOARD") {
      clearInterval(timer);
    }
  }, [curBooking]);

  useEffect(() => {
    if (lastLocation && curBooking && curBooking.status == "ACCEPTED") {
      let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
      let point2 = { lat: curBooking.pickup.lat, lng: curBooking.pickup.lng };
      if (pageActive.current) {
        fitMap(point1, point2);
      }
      setlastCoords(lastLocation);
    }

    if (curBooking && curBooking.status == "ARRIVED") {
      setlastCoords(null);
      setTimeout(() => {
        mapRef.current.fitToCoordinates(
          [
            {
              latitude: curBooking.pickup.lat,
              longitude: curBooking.pickup.lng,
            },
            { latitude: curBooking.drop.lat, longitude: curBooking.drop.lng },
          ],
          {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true,
          }
        );
      }, 1000);
    }
    if (lastLocation && curBooking && curBooking.status == "STARTED") {
      let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
      let point2 = { lat: curBooking.drop.lat, lng: curBooking.drop.lng };
      if (pageActive.current) {
        fitMap(point1, point2);
      }
      setlastCoords(lastLocation);
    }
    if (
      lastLocation &&
      curBooking &&
      curBooking.status == "REACHED" &&
      role == "rider"
    ) {
      setTimeout(() => {
        mapRef.current.fitToCoordinates(
          [
            {
              latitude: curBooking.pickup.lat,
              longitude: curBooking.pickup.lng,
            },
            { latitude: lastLocation.lat, longitude: lastLocation.lng },
          ],
          {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true,
          }
        );
      }, 1000);
    }
  }, [lastLocation, curBooking]);

  const fitMap = (point1, point2) => {
    let startLoc = '"' + point1.lat + "," + point1.lng + '"';
    let destLoc = '"' + point2.lat + "," + point2.lng + '"';
    getRouteDetails(startLoc, destLoc).then((details) => {
      setArrivalTime(
        details.duration ? parseFloat(details.duration / 60).toFixed(0) : 0
      );
      let points = Polyline.decode(details.polylinePoints);
      let coords = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1],
        };
      });
      setLiveRouteCoords(coords);
      mapRef.current.fitToCoordinates(
        [
          { latitude: point1.lat, longitude: point1.lng },
          { latitude: point2.lat, longitude: point2.lng },
        ],
        {
          edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
          animated: true,
        }
      );
    });
  };
  const locateUser = async () => {
    // if (tripdata.selected == "pickup") {
    let tempWatcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
      },
      (location) => {
        dispatch({
          type: "UPDATE_GPS_LOCATION",
          payload: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          },
        });
        tempWatcher.remove();
      }
    );
    // }
  };

  useEffect(() => {
    if (activeBookings && activeBookings.length >= 1) {
      let booking = activeBookings.filter(
        (booking) => booking.id == bookingId
      )[0];
      if (booking) {
        setCurBooking(booking);
        if (booking.status == "NEW" && booking.bookLater == false) {
          if (role == "rider") setSearchModalVisible(true);
        }
        if (booking.status == "ACCEPTED") {
          if (role == "rider") setSearchModalVisible(false);
          if (role == "rider") dispatch(fetchBookingLocations(bookingId));
        }
        if (booking.status == "ARRIVED") {
          if (role == "rider") dispatch(fetchBookingLocations(bookingId));
        }
        if (booking.status == "STARTED") {
          if (role == "rider") dispatch(fetchBookingLocations(bookingId));
        }
        if (booking.status == "REACHED") {
          if (role == "driver") {
            if (booking.prepaid) {
              booking.status = "PAID";
              dispatch(updateBooking(booking));
            } else {
              // Do Payment Here
              if (booking.paymentMethodModalId == "COD") {
                doPayment("cash");
              } else {
                doPayment("card");
              }
            }
          } else {
            dispatch(stopLocationFetch(bookingId));
          }
        }
        // if (booking.status == "PENDING") {
        //   if (role == "rider")
        //     props.navigation.navigate("PaymentDetails", { booking: booking });
        // }
        if ((booking.status == "PAID") & pageActive.current) {
          if (role == "rider")
            props.navigation.navigate("DriverRating", {
              bookingId: booking.id,
            });
          if (role == "driver") props.navigation.navigate("DriverTrips");
        }
        if (
          (booking.status == "ACCEPTED" || booking.status == "ARRIVED") &&
          booking.pickup_image
        ) {
          setLoading(false);
        }
        if (booking.status == "STARTED" && booking.deliver_image) {
          setLoading(false);
        }
      } else {
        setModalVisible(false);
        setSearchModalVisible(false);
        props.navigation.navigate("RideList", { fromBooking: true });
      }
    } else {
      setModalVisible(false);
      setSearchModalVisible(false);
      if (role == "driver") {
        props.navigation.navigate("DriverTrips");
      } else {
        props.navigation.navigate("RideList", { fromBooking: true });
      }
    }
  }, [activeBookings]);

  const renderButtons = () => {
    return (curBooking &&
      role == "rider" &&
      (curBooking.status == "NEW" ||
        curBooking.status == "ACCEPTED" ||
        curBooking.status == "CUSTOMER_ON_BOARD" ||
        curBooking.status == "ARRIVED")) ||
      (curBooking &&
        role == "driver" &&
        (curBooking.status == "ACCEPTED" ||
          curBooking.status == "ARRIVED" ||
          curBooking.status == "STARTED" ||
          curBooking.status == "CUSTOMER_ON_BOARD")) ? (
      <View style={{ flex: 1 }}>
        {role == "driver" &&
        ((curBooking.pickup_image && appcat == "delivery") ||
          (!settings.AllowDeliveryPickupImageCapture && appcat == "delivery") ||
          appcat == "taxi") &&
        curBooking.status == "ARRIVED" ? (
          <View style={{ flex: 1, marginTop: -45, marginBottom: 10 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: "red",
                textAlign: "center",
              }}
            >
              {fmtMSS(counter)}
            </Text>

            <View style={{ marginBottom: 10 }}>
              <Button
                title={t("passenger_on_board")}
                loading={false}
                loadingProps={{ size: "large", color: colors.WHITE }}
                titleStyle={{ color: colors.WHITE, fontWeight: "bold" }}
                onPress={() => {
                  customerOnBoard();
                }}
                buttonStyle={{
                  height: "100%",
                  backgroundColor: colors.PRIMARY,
                  borderRadius: 10,
                }}
                containerStyle={{ height: 45 }}
              />
            </View>
          </View>
        ) : curBooking.status == "CUSTOMER_ON_BOARD" && role === "driver" ? (
          <View style={{ flex: 1, marginTop: -10, marginBottom: 10 }}>
            <Button
              title={t("start_race")}
              loading={false}
              loadingProps={{ size: "large", color: colors.WHITE }}
              titleStyle={{ color: colors.WHITE, fontWeight: "bold" }}
              onPress={() => {
                if (curBooking.otp && appcat == "taxi") {
                  setOtpModalVisible(true);
                } else {
                  startBooking();
                }
              }}
              buttonStyle={{
                height: "100%",
                backgroundColor: colors.PRIMARY,
                borderRadius: 10,
              }}
              containerStyle={{ height: 45 }}
            />
          </View>
        ) : null}
        {(role == "rider" &&
          !curBooking.pickup_image &&
          (curBooking.status == "NEW" ||
            curBooking.status == "ACCEPTED" ||
            curBooking.status == "CUSTOMER_ON_BOARD" ||
            curBooking.status == "ARRIVED")) ||
        (role == "driver" &&
          !curBooking.pickup_image &&
          (curBooking.status == "ACCEPTED" ||
            curBooking.status == "ARRIVED" ||
            curBooking.status == "CUSTOMER_ON_BOARD")) ? (
          <View style={{ flex: 1.5 }}>
            <Button
              title={role !== "driver" ? "Annuler" : "Annuler course"}
              loading={false}
              loadingProps={{ size: "large", color: colors.INDICATOR_BLUE }}
              titleStyle={{ color: colors.WHITE, fontWeight: "bold" }}
              onPress={() => {
                role == "rider"
                  ? setModalVisible(true)
                  : Alert.alert(t("alert"), t("cancel_confirm"), [
                      { text: t("cancel"), onPress: () => {}, style: "cancel" },
                      {
                        text: t("ok"),
                        onPress: () =>
                          dispatch(
                            cancelBooking({
                              booking: curBooking,
                              reason: t("driver_cancelled_booking"),
                              cancelledBy: role,
                            })
                          ),
                      },
                    ]);
              }}
              buttonStyle={[
                {
                  height: 50,
                  backgroundColor:
                    (curBooking && curBooking.status == "NEW") ||
                    role == "driver"
                      ? colors.RED
                      : "#6FAC2D",
                  borderRadius:
                    (curBooking && curBooking.status == "CUSTOMER_ON_BOARD") ||
                    (curBooking &&
                      curBooking.status == "ARRIVED" &&
                      role == "driver")
                      ? 10
                      : 50,

                  width:
                    curBooking && curBooking.status == "NEW"
                      ? width / 3
                      : width * 0.9,
                  paddingHorizontal: 20,
                  alignSelf: "center",
                },
                curBooking &&
                  curBooking.status == "NEW" && {
                    marginVertical: 20,
                  },
              ]}
              containerStyle={{ height: "100%" }}
            />
          </View>
        ) : null}
        {appcat == "delivery" &&
        settings.AllowDeliveryPickupImageCapture &&
        role == "driver" &&
        !curBooking.pickup_image &&
        (curBooking.status == "ACCEPTED" || curBooking.status == "ARRIVED") ? (
          <View style={{ flex: 1 }}>
            <Button
              title={t("take_pickup_image")}
              loading={loading}
              loadingProps={{ size: "large", color: colors.WHITE }}
              onPress={() => _pickImage(ImagePicker.launchCameraAsync)}
              buttonStyle={{
                height: "100%",
                backgroundColor: colors.BUTTON_ORANGE,
              }}
              containerStyle={{ height: "100%" }}
            />
          </View>
        ) : null}

        {appcat == "delivery" &&
        settings.AllowFinalDeliveryImageCapture &&
        role == "driver" &&
        !curBooking.deliver_image &&
        curBooking.status == "STARTED" ? (
          <View style={{ flex: 1 }}>
            <Button
              title={t("take_deliver_image")}
              loading={loading}
              loadingProps={{ size: "large", color: colors.WHITE }}
              titleStyle={{ color: colors.WHITE, fontWeight: "bold" }}
              onPress={() => _pickImage(ImagePicker.launchCameraAsync)}
              buttonStyle={{
                height: "100%",
                backgroundColor: colors.BUTTON_ORANGE,
              }}
              containerStyle={{ height: "100%" }}
            />
          </View>
        ) : null}
        {role == "driver" &&
        ((curBooking.deliver_image && appcat == "delivery") ||
          (!settings.AllowFinalDeliveryImageCapture && appcat == "delivery") ||
          appcat == "taxi") &&
        curBooking.status == "STARTED" ? (
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.PROFILE_PLACEHOLDER_CONTENT,
                fontSize: 12,
                textAlign: "left",
              }}
            >
              Veuillez saisir le montant du compteur
            </Text>
            <TextInput
              style={{
                color: colors.BACKGROUND,
                fontSize: 12,
                fontFamily: "Roboto-Regular",
                //textAlign: "left",
                marginTop: 8,
                marginLeft: 5,
                borderWidth: 1,
                borderColor: colors.PROFILE_PLACEHOLDER_CONTENT,
                borderRadius: 5,
                marginBottom: 10,
                padding: 5,
              }}
              placeholder={
                "Merci d'utiliser un point et non la virgule pour écrire le montant."
              }
              onChangeText={(value) => setTripCost(value)}
              value={trip_cost}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Icon
                name={
                  curBooking.paymentMethodModalId == "COD" ? "cash" : "card"
                }
                type="ionicon"
                size={25}
                // color={colors.INDICATOR_BLUE}
              />
              <Text
                style={{
                  color: colors.PROFILE_PLACEHOLDER_TEXT,
                  fontSize: 16,
                  marginBottom: 10,
                  marginLeft: 10,
                }}
              >
                {curBooking.paymentMethodModalId == "COD"
                  ? "Paiement à bord CB/Espèces"
                  : "payé par carte bancaire"}
              </Text>
            </View>
            <Button
              title={"Valider"}
              loading={false}
              titleStyle={{ color: colors.WHITE, fontWeight: "bold" }}
              onPress={() => {
                if (curBooking.otp && appcat == "delivery") {
                  setOtpModalVisible(true);
                } else {
                  endBooking();
                }
              }}
              buttonStyle={{
                height: "100%",
                backgroundColor: colors.PRIMARY,
                height: 50,
                borderRadius: 5,
                width: width * 0.5,
                alignSelf: "center",
              }}
              containerStyle={{ height: "100%" }}
            />
          </View>
        ) : null}
      </View>
    ) : null;
  };

  const startBooking = () => {
    setOtpModalVisible(false);
    let booking = { ...curBooking };
    booking.status = "STARTED";
    dispatch(updateBooking(booking));
  };

  const customerOnBoard = () => {
    setOtpModalVisible(false);
    let booking = { ...curBooking };
    booking.status = "CUSTOMER_ON_BOARD";
    dispatch(updateBooking(booking));
  };

  const endBooking = () => {
    let booking = { ...curBooking };
    booking.trip_cost = trip_cost;
    booking.status = "REACHED";
    dispatch(updateBooking(booking));
    setOtpModalVisible(false);
  };

  const startNavigation = () => {
    const params = [
      {
        key: "travelmode",
        value: "driving",
      },
      {
        key: "dir_action",
        value: "navigate",
      },
    ];
    let data = null;
    try {
      if (curBooking.status == "ACCEPTED") {
        data = {
          source: {
            latitude: lastLocation.lat,
            longitude: lastLocation.lng,
          },
          destination: {
            latitude: curBooking.pickup.lat,
            longitude: curBooking.pickup.lng,
          },
          params: params,
        };
      }
      if (curBooking.status == "STARTED") {
        data = {
          source: {
            latitude: lastLocation.lat,
            longitude: lastLocation.lng,
          },
          destination: {
            latitude: curBooking.drop.lat,
            longitude: curBooking.drop.lng,
          },
          params: params,
        };
      }

      if (data && data.source.latitude) {
        getDirections(data);
      } else {
        Alert.alert(t("alert"), t("navigation_available"));
      }
    } catch (error) {
      Alert.alert(t("alert"), t("location_error"));
    }
  };

  //ride cancel confirm modal design
  const alertModal = () => {
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={alertModalVisible}
        onRequestClose={() => {
          setAlertModalVisible(false);
        }}
      >
        <View style={styles.alertModalContainer}>
          <View style={styles.alertModalInnerContainer}>
            <View style={styles.alertContainer}>
              <Text style={styles.rideCancelText}>
                {t("rider_cancel_text")}
              </Text>

              <View style={styles.horizontalLLine} />

              <View style={styles.msgContainer}>
                <Text style={styles.cancelMsgText}>
                  {t("cancel_messege1")} {bookingId} {t("cancel_messege2")}
                </Text>
              </View>
              <View style={styles.okButtonContainer}>
                <Button
                  title={t("no_driver_found_alert_OK_button")}
                  titleStyle={styles.signInTextStyle}
                  onPress={() => {
                    setAlertModalVisible(false);
                    props.navigation.popToTop();
                  }}
                  buttonStyle={styles.okButtonStyle}
                  containerStyle={styles.okButtonContainerStyle}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const searchModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={() => {
          setSearchModalVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: colors.BACKGROUND,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: colors.WHITE,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              maxHeight: 310,
              marginTop: 15,
            }}
          >
            <Image
              source={require("../../assets/images/lodingDriver.gif")}
              resizeMode={"contain"}
              style={{ width: 160, height: 160, marginTop: 15 }}
            />
            <View>
              <Text
                style={{
                  color: colors.BLACK,
                  fontSize: 16,
                  marginTop: 12,
                  fontWeight: "bold",
                }}
              >
                {t("driver_assign_messege")}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title={t("close")}
                loading={false}
                loadingProps={{ size: "large" }}
                titleStyle={styles.buttonTitleText}
                onPress={() => {
                  setSearchModalVisible(false);
                }}
                buttonStyle={{
                  width: 250,
                  backgroundColor: "#808080",
                  borderRadius: 25,
                }}
                containerStyle={{ marginTop: 20 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const chat = () => {
    props.navigation.navigate("onlineChat", { bookingId: bookingId });
  };

  const onPressCall = (phoneNumber) => {
    let call_link =
      Platform.OS == "android"
        ? "tel:" + phoneNumber
        : "telprompt:" + phoneNumber;
    Linking.canOpenURL(call_link)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(call_link);
        }
      })
      .catch((error) => console.log(error));
  };

  const _pickImage = async (res) => {
    var pickFrom = res;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status == "granted") {
      let result = await pickFrom({
        allowsEditing: true,
        aspect: [3, 3],
        base64: true,
      });

      if (!result.cancelled) {
        let data = "data:image/jpeg;base64," + result.base64;
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function () {
            Alert.alert(t("alert"), t("image_upload_error"));
            setLoader(false);
          };
          xhr.responseType = "blob";
          xhr.open("GET", Platform.OS == "ios" ? data : result.uri, true);
          xhr.send(null);
        });
        if (blob) {
          setLoading(true);
          dispatch(
            updateBookingImage(
              curBooking,
              curBooking.status == "ACCEPTED" || curBooking.status == "ARRIVED"
                ? "pickup_image"
                : "deliver_image",
              blob
            )
          );
        }
      }
    }
  };

  const PurchaseInfoModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={purchaseInfoModalStatus}
        onRequestClose={() => {
          setPurchaseInfoModalStatus(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ width: "100%" }}>
              <View
                style={[
                  styles.textContainerStyle,
                  { alignItems: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.textHeading}>{t("parcel_type")}</Text>
                <Text style={styles.textContent}>
                  {curBooking && curBooking.parcelTypeSelected
                    ? curBooking.parcelTypeSelected.description
                    : ""}
                </Text>
              </View>
              <View
                style={[
                  styles.textContainerStyle,
                  { alignItems: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.textHeading}>{t("options")}</Text>
                <Text style={styles.textContent}>
                  {curBooking && curBooking.optionSelected
                    ? curBooking.optionSelected.description
                    : ""}
                </Text>
              </View>
              <View
                style={[
                  styles.textContainerStyle,
                  { alignItems: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.textHeading}>{t("deliveryPerson")}</Text>
                <Text style={styles.textContent}>
                  {curBooking ? curBooking.deliveryPerson : ""}
                </Text>
              </View>
              <View
                style={[
                  styles.textContainerStyle,
                  { alignItems: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.textHeading}>
                  {t("deliveryPersonPhone")}
                </Text>
                <Text style={styles.textContent}>
                  {curBooking ? curBooking.deliveryPersonPhone : ""}
                </Text>
              </View>
              <View
                style={[
                  styles.textContainerStyle,
                  { alignItems: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.textHeading}>
                  {t("pickUpInstructions")}
                </Text>
                <Text style={styles.textContent}>
                  {curBooking ? curBooking.pickUpInstructions : ""}
                </Text>
              </View>
              <View
                style={[
                  styles.textContainerStyle,
                  { alignItems: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.textHeading}>
                  {t("deliveryInstructions")}
                </Text>
                <Text style={styles.textContent}>
                  {curBooking ? curBooking.deliveryInstructions : ""}
                </Text>
              </View>
            </View>
            <View
              style={{ flexDirection: "row", alignSelf: "center", height: 40 }}
            >
              <OldTouch
                loading={false}
                onPress={() => setPurchaseInfoModalStatus(false)}
                style={styles.modalButtonStyle}
              >
                <Text style={styles.modalButtonTextStyle}>{t("ok")}</Text>
              </OldTouch>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const UserInfoModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={userInfoModalStatus}
        onRequestClose={() => {
          setUserInfoModalStatus(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={{ width: "100%" }}>
              <View
                style={[
                  styles.textContainerStyle,
                  { alignItems: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.textHeading1}>
                  {t("deliveryPersonPhone")}
                </Text>
                <Text
                  style={styles.textContent1}
                  onPress={() => onPressCall(curBooking.deliveryPersonPhone)}
                >
                  <Icon
                    name="ios-call"
                    type="ionicon"
                    size={15}
                    color={colors.INDICATOR_BLUE}
                  />
                  {curBooking ? curBooking.deliveryPersonPhone : ""}
                </Text>
              </View>
              <View
                style={[
                  styles.textContainerStyle,
                  { alignItems: isRTL ? "flex-end" : "flex-start" },
                ]}
              >
                <Text style={styles.textHeading1}>
                  {t("senderPersonPhone")}
                </Text>

                <Text
                  style={styles.textContent1}
                  onPress={() => onPressCall(curBooking.customer_contact)}
                >
                  <Icon
                    name="ios-call"
                    type="ionicon"
                    size={15}
                    color={colors.INDICATOR_BLUE}
                  />
                  {curBooking ? curBooking.customer_contact : ""}
                </Text>
              </View>
            </View>
            <View
              style={{ flexDirection: "row", alignSelf: "center", height: 40 }}
            >
              <OldTouch
                loading={false}
                onPress={() => setUserInfoModalStatus(false)}
                style={styles.modalButtonStyle}
              >
                <Text style={styles.modalButtonTextStyle}>{t("ok")}</Text>
              </OldTouch>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const onShare = async (curBooking) => {
    try {
      const result = await Share.share({
        message: curBooking.otp + t("otp_sms"),
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const lCom = {
    icon: "ios-arrow-back",
    type: "ionicon",
    color: colors.PRIMARY,
    size: 30,
    component: TouchableWithoutFeedback,
    onPress: () => {
      setShouldVisible(false);
      setBookLaterModalStatus(false);
      props.navigation.navigate("RideList");
    },
  };

  return (
    <View style={styles.mainContainer}>
      <NavigationEvents
        onWillBlur={(payload) => {
          // dispatch(stopFetchMessages(bookingId));

          pageActive.current = false;
          if (role == "rider") {
            dispatch(stopLocationFetch(bookingId));
          }
        }}
        onDidBlur={(payload) => {
          pageActive.current = false;
          if (role == "rider") {
            dispatch(stopLocationFetch(bookingId));
          }
        }}
        onWillFocus={(payload) => {
          dispatch(fetchChatMessages(bookingId));

          pageActive.current = true;
        }}
        onDidFocus={(payload) => {
          pageActive.current = true;
        }}
      />
      {role === "driver" && (
        <View>
          <View style={[styles.menuIcon, { left: 20 }]}>
            <TouchableOpacity
              onPress={() => {
                props.navigation?.toggleDrawer();
              }}
              style={styles.menuIconButton}
            >
              <Icon name="menu" type="ionicon" color="#517fa4" size={32} />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.menuIcon,
              { left: "30%", width: 150, backgroundColor: colors.BOX_BG },
            ]}
          >
            <TouchableOpacity
              // onPress={() => {
              //   props.navigation.toggleDrawer();
              // }}
              style={styles.menuIconButton}
            >
              <Text
                style={[
                  styles.textContent,
                  {
                    width: 150,
                    textAlign: "center",
                    color: colors.WHITE,
                  },
                ]}
              >
                EN LIGNE
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.menuIcon, { right: 20 }]}>
            <TouchableOpacity
              onPress={() => {
                locateUser();
              }}
              style={styles.menuIconButton}
            >
              <Icon name="gps-fixed" color={"#666699"} size={26} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.mapcontainer}>
        {curBooking ? (
          <MapView
            onPress={() => {
              curBooking && curBooking.status == "STARTED"
                ? setModalVisible(true)
                : null;
            }}
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: curBooking.pickup.lat,
              longitude: curBooking.pickup.lng,
              latitudeDelta: latitudeDelta,
              longitudeDelta: longitudeDelta,
            }}
          >
            {(curBooking.status == "ACCEPTED" ||
              curBooking.status == "ARRIVED" ||
              curBooking.status == "STARTED") &&
            lastLocation ? (
              <Marker.Animated
                coordinate={
                  new AnimatedRegion({
                    latitude: lastLocation.lat,
                    longitude: lastLocation.lng,
                    latitudeDelta: latitudeDelta,
                    longitudeDelta: longitudeDelta,
                  })
                }
              >
                <Image
                  source={carImageIcon}
                  style={{ height: 40, width: 40 }}
                />
              </Marker.Animated>
            ) : null}

            <Marker
              coordinate={{
                latitude: curBooking.pickup.lat,
                longitude: curBooking.pickup.lng,
              }}
              title={curBooking.pickup.add}
              pinColor={colors.GREEN_DOT}
            />
            <Marker
              coordinate={{
                latitude: curBooking.drop.lat,
                longitude: curBooking.drop.lng,
              }}
              title={curBooking.drop.add}
            />

            {liveRouteCoords &&
            (curBooking.status == "ACCEPTED" ||
              curBooking.status == "STARTED") ? (
              <MapView.Polyline
                coordinates={liveRouteCoords}
                strokeWidth={5}
                strokeColor={colors.INDICATOR_BLUE}
                lineDashPattern={[1]}
              />
            ) : null}

            {(curBooking.status == "ARRIVED" ||
              curBooking.status == "REACHED") &&
            curBooking.coords ? (
              <MapView.Polyline
                coordinates={curBooking.coords}
                strokeWidth={4}
                strokeColor={colors.INDICATOR_BLUE}
                lineDashPattern={[1]}
              />
            ) : null}
          </MapView>
        ) : null}
      </View>
      {(curBooking && curBooking.status == "ACCEPTED") ||
      (curBooking && curBooking.status == "ARRIVED") ||
      (curBooking && curBooking.status == "CUSTOMER_ON_BOARD") ? (
        <View
          style={[
            styles.bottomContainer,
            {
              flex: 6.5,
            },
          ]}
        >
          <View style={styles.cabDetailsContainer}>
            <View style={{ flexDirection: "column" }}>
              <View style={styles.driverDetails}>
                <View style={styles.driverPhotoContainer}>
                  {role == "rider" ? (
                    <Image
                      source={
                        curBooking.driver_image
                          ? { uri: curBooking.driver_image }
                          : require("../../assets/images/profilePic.png")
                      }
                      style={styles.driverPhoto}
                    />
                  ) : (
                    <Image
                      source={
                        curBooking.customer_image
                          ? { uri: curBooking.customer_image }
                          : require("../../assets/images/profilePic.png")
                      }
                      style={styles.driverPhoto}
                    />
                  )}
                </View>

                <View style={styles.driverNameContainer}>
                  {role == "rider" ? (
                    <Text
                      style={[
                        styles.driverNameText,
                        {
                          color: colors.BLACK,
                        },
                      ]}
                    >
                      {curBooking.driver_name}
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.driverNameText,
                        {
                          color: colors.BLACK,
                        },
                      ]}
                    >
                      {curBooking.customer_name}
                    </Text>
                  )}
                  {/* <Text
                    style={[
                      styles.driverNameText,
                      {
                        fontSize: 14,
                      },
                    ]}
                  >
                    Chauffeur verifié-e
                  </Text> */}
                </View>
                <TouchableOpacity
                  style={[
                    styles.floatButton,
                    {
                      alignSelf: "center",
                      margin: 10,
                      backgroundColor: "#29AB1B",
                    },
                    // isRTL
                    //   ? { left: 10, bottom: 80 }
                    //   : { right: 10, bottom: 80 },
                  ]}
                  onPress={() => chat()}
                >
                  {hasUnreadMessages && (
                    <Icon
                      name="dot-single"
                      type="entypo"
                      size={30}
                      containerStyle={{
                        marginBottom: -10,
                        marginTop: -20,
                        marginLeft: 20,
                      }}
                      color={colors.RED}
                    />
                  )}
                  <Icon
                    name="chatbubble"
                    type="ionicon"
                    size={20}
                    color={colors.WHITE}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.floatButton,
                    // isRTL
                    //   ? { left: 10, bottom: 10 }
                    //   : { right: 10, bottom: 10 },
                    {
                      alignSelf: "center",
                      margin: 10,
                      backgroundColor: "#3E6EB2",
                    },
                  ]}
                  onPress={() =>
                    role == "rider"
                      ? onPressCall(curBooking.driver_contact)
                      : appcat == "taxi"
                      ? onPressCall(curBooking.customer_contact)
                      : setUserInfoModalStatus(true)
                  }
                >
                  <Icon
                    name="ios-call"
                    type="ionicon"
                    size={30}
                    color={colors.WHITE}
                  />
                </TouchableOpacity>
              </View>
              {role === "driver" ? (
                <View
                  style={[
                    styles.addressViewStyle,
                    isRTL ? { paddingRight: 10 } : { paddingLeft: 10 },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: isRTL ? "column-reverse" : "column",
                      // alignItems: "center",
                      justifyContent: "center",
                      marginHorizontal: 10,
                      // marginVertical: 10,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderColor: "#f7f7f7",
                      borderWidth: 1,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: isRTL ? "row-reverse" : "row",
                        alignItems: "center",
                      }}
                    >
                      <View style={styles.greenDot}></View>
                      <Text
                        style={[
                          styles.addressViewTextStyle,
                          isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                          { textAlign: isRTL ? "right" : "left" },
                        ]}
                      >
                        DESTINATION
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.addressViewTextStyle,
                        isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                        { textAlign: isRTL ? "right" : "left" },
                        { color: colors.BLACK },
                      ]}
                    >
                      {curBooking &&
                        curBooking.status === "ACCEPTED" &&
                        curBooking.pickup &&
                        curBooking.pickup.add}
                      {curBooking &&
                        curBooking.status === "ARRIVED" &&
                        curBooking.drop &&
                        curBooking.drop.add}
                      {curBooking &&
                        curBooking.status === "CUSTOMER_ON_BOARD" &&
                        curBooking.drop &&
                        curBooking.drop.add}
                    </Text>
                    {curBooking && curBooking.status === "ACCEPTED" && (
                      <TouchableOpacity
                        onPress={startNavigation}
                        style={{
                          flexDirection: isRTL ? "row-reverse" : "row",
                          // alignItems: "center",
                          justifyContent: "center",
                          marginHorizontal: 10,
                          // marginVertical: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                          borderColor: "#f7f7f7",
                          borderWidth: 1,
                          height: 50,
                        }}
                      >
                        <Icon
                          name="navigation"
                          type="Feather"
                          color={colors.PRIMARY}
                          size={25}
                        />
                        <Text
                          style={[
                            styles.addressViewTextStyle,
                            isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                            { textAlign: isRTL ? "right" : "left" },
                            { color: colors },
                          ]}
                        >
                          Afficher la navigation
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ) : null}

              {role == "rider" ? (
                <View style={{ flexDirection: "row", marginHorizontal: 30 }}>
                  <View style={styles.verticalDesign}>
                    <View style={styles.triangle} />
                    <View style={styles.verticalLine} />
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: colors.GREEN_DOT,
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: "column" }}>
                    <View style={{ flexDirection: "row" }}>
                      <Image
                        source={{ uri: curBooking.carImage }}
                        resizeMode={"contain"}
                        style={styles.cabImage}
                      />
                      <View>
                        <Text style={styles.cabNameText}>
                          {curBooking.carType}
                        </Text>
                        <Text style={styles.cabNumberText}>
                          {curBooking.vehicle_number}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.cabNameText,
                        {
                          marginLeft: 30,
                          marginTop: 10,
                        },
                      ]}
                    >
                      {curBooking.dropAddress}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
          {renderButtons()}
        </View>
      ) : null}
      {curBooking && curBooking.status == "STARTED" && role === "driver" ? (
        <View
          style={[
            styles.bottomContainer,
            {
              flex: 14,
            },
          ]}
        >
          <View style={styles.cabDetailsContainer}>
            <View style={{ flexDirection: "column" }}>
              <View style={styles.driverDetails}>
                <View style={styles.driverPhotoContainer}>
                  {role == "rider" ? (
                    <Image
                      source={
                        curBooking.driver_image
                          ? { uri: curBooking.driver_image }
                          : require("../../assets/images/profilePic.png")
                      }
                      style={styles.driverPhoto}
                    />
                  ) : (
                    <Image
                      source={
                        curBooking.customer_image
                          ? { uri: curBooking.customer_image }
                          : require("../../assets/images/profilePic.png")
                      }
                      style={styles.driverPhoto}
                    />
                  )}
                </View>
                <View style={styles.driverNameContainer}>
                  {role == "rider" ? (
                    <Text
                      style={[
                        styles.driverNameText,
                        {
                          color: colors.BLACK,
                        },
                      ]}
                    >
                      {curBooking.driver_name}
                    </Text>
                  ) : (
                    <Text
                      style={[
                        styles.driverNameText,
                        {
                          color: colors.BLACK,
                        },
                      ]}
                    >
                      {curBooking.customer_name}
                    </Text>
                  )}
                  {/* <Text
                    style={[
                      styles.driverNameText,
                      {
                        fontSize: 14,
                      },
                    ]}
                  >
                    Chauffeur verifié-e
                  </Text> */}
                </View>

                <TouchableOpacity
                  style={[
                    styles.floatButton,
                    {
                      alignSelf: "center",
                      margin: 10,
                      backgroundColor: "#29AB1B",
                    },
                    // isRTL
                    //   ? { left: 10, bottom: 80 }
                    //   : { right: 10, bottom: 80 },
                  ]}
                  onPress={() => chat()}
                >
                  {hasUnreadMessages && (
                    <Icon
                      name="dot-single"
                      type="entypo"
                      size={30}
                      color={colors.RED}
                      containerStyle={{
                        marginBottom: -10,
                        marginTop: -20,
                        marginLeft: 20,
                      }}
                    />
                  )}

                  <Icon
                    name="chatbubble"
                    type="ionicon"
                    size={20}
                    color={colors.WHITE}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.floatButton,
                    // isRTL
                    //   ? { left: 10, bottom: 10 }
                    //   : { right: 10, bottom: 10 },
                    {
                      alignSelf: "center",
                      margin: 10,
                      backgroundColor: "#3E6EB2",
                    },
                  ]}
                  onPress={() =>
                    role == "rider"
                      ? onPressCall(curBooking.driver_contact)
                      : appcat == "taxi"
                      ? onPressCall(curBooking.customer_contact)
                      : setUserInfoModalStatus(true)
                  }
                >
                  <Icon
                    name="ios-call"
                    type="ionicon"
                    size={30}
                    color={colors.WHITE}
                  />
                </TouchableOpacity>
              </View>
              {role === "driver" ? (
                <View
                  style={[
                    styles.addressViewStyle,
                    isRTL ? { paddingRight: 10 } : { paddingLeft: 10 },
                    { marginTop: -5 },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: isRTL ? "column-reverse" : "column",
                      // alignItems: "center",
                      justifyContent: "center",
                      marginHorizontal: 10,
                      // marginVertical: ,
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      borderColor: "#f7f7f7",
                      borderWidth: 1,
                    }}
                  >
                    <TouchableOpacity
                      onPress={startNavigation}
                      style={{
                        flexDirection: isRTL ? "row-reverse" : "row",
                        alignItems: "center",
                        justifyContent: "center",
                        // marginHorizontal: 10,
                        // marginVertical: 10,
                        // paddingHorizontal: 20,
                        // paddingVertical: 10,
                        borderColor: "#f7f7f7",
                        borderWidth: 1,
                        height: 50,
                      }}
                    >
                      <Icon
                        name="navigation"
                        type="Feather"
                        color={colors.PRIMARY}
                        size={25}
                      />
                      <Text
                        style={[
                          styles.addressViewTextStyle,
                          isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                          { textAlign: isRTL ? "right" : "left" },
                          { color: colors.PRIMARY },
                        ]}
                      >
                        Afficher la navigation
                      </Text>
                    </TouchableOpacity>
                    <View
                      style={{
                        flexDirection: isRTL ? "row-reverse" : "row",
                        alignItems: "center",
                      }}
                    >
                      <View style={styles.greenDot}></View>
                      <Text
                        style={[
                          styles.addressViewTextStyle,
                          isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                          { textAlign: isRTL ? "right" : "left" },
                        ]}
                      >
                        DESTINATION
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.addressViewTextStyle,
                        isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                        { textAlign: isRTL ? "right" : "left" },
                        { color: colors.BLACK },
                        { fontSize: 12 },
                      ]}
                    >
                      {curBooking &&
                        curBooking.drop &&
                        curBooking.drop.add &&
                        curBooking.drop.add.substring(0, 50) + "..."}
                    </Text>
                  </View>
                  {renderButtons()}
                </View>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}
      {curBooking && curBooking.status == "STARTED" && role === "rider" ? (
        <View style={styles.bottomContainer}>
          <Text
            style={[
              styles.cabBoldText,
              {
                fontSize: 22,
                marginTop: 20,
                marginBottom: 20,
                color: colors.PROFILE_PLACEHOLDER_CONTENT,
              },
            ]}
          >
            Votre course est en cours…
          </Text>
          <Image
            source={require("../../assets/images/loading-bar.gif")}
            style={{
              width: width * 0.8,
              height: width * 0.8 * 0.4,
              marginTop: -50,
              marginBottom: -20,
            }}
          />

          <View style={{ flexDirection: "row" }}>
            <View style={styles.ballandsquare}>
              <View style={styles.hbox1} />
              <View
                style={{
                  height: 60,
                  backgroundColor: "black",
                  borderWidth: 1,
                  borderColor: "white",
                  borderRadius: 1,
                  borderStyle: "dashed",
                  zIndex: 0,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: -1,
                    top: -1,
                    width: 1,
                    height: "100%",
                    backgroundColor: "black",
                    zIndex: 1,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    right: -1,
                    top: -1,
                    width: 1,
                    height: "100%",
                    backgroundColor: "black",
                    zIndex: 1,
                  }}
                />
              </View>
              <View style={styles.hbox3} />
            </View>
            <View
              style={[
                styles.contentStyle,
                isRTL ? { paddingRight: 10 } : { paddingLeft: 10 },
              ]}
            >
              <TouchableOpacity
                // onPress={() => tapAddress("pickup")}
                style={styles.addressStyle1}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.textStyle,
                    // curBooking.selected == "pickup"
                    //   ? { fontSize: 18 }
                    //   :
                    { fontSize: 14 },
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {curBooking && curBooking.pickup && curBooking.pickup.add
                    ? curBooking.pickup.add
                    : t("map_screen_where_input_text")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={() => tapAddress("drop")}
                style={styles.addressStyle2}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.textStyle,
                    // curBooking.selected == "drop"
                    //   ? { fontSize: 18 }
                    //   :
                    { fontSize: 14 },
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {curBooking && curBooking.drop
                    ? curBooking.drop.add
                    : t("map_screen_drop_input_text")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {renderButtons()}
        </View>
      ) : null}
      <Modal
        animationType="slide"
        transparent={true}
        visible={
          curBooking && curBooking.status == "NEW" && shouldVisible
            ? true
            : false
        }
      >
        <View
          style={{
            flex: 19,
            backgroundColor: colors.WHITE,
            borderRadius: 10,
            margin: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {role == "rider" ? (
            <Header
              backgroundColor={colors.WHITE}
              leftComponent={lCom}
              containerStyle={styles.headerStyle}
              innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
          ) : null}
          <View style={{ flexDirection: "row" }}>
            <View style={styles.ballandsquare}>
              <View style={styles.hbox1} />
              <View
                style={{
                  height: 60,
                  backgroundColor: "black",
                  borderWidth: 1,
                  borderColor: "white",
                  borderRadius: 1,
                  borderStyle: "dashed",
                  zIndex: 0,
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: -1,
                    top: -1,
                    width: 1,
                    height: "100%",
                    backgroundColor: "black",
                    zIndex: 1,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    right: -1,
                    top: -1,
                    width: 1,
                    height: "100%",
                    backgroundColor: "black",
                    zIndex: 1,
                  }}
                />
              </View>
              <View style={styles.hbox3} />
            </View>
            <View
              style={[
                styles.contentStyle,
                isRTL ? { paddingRight: 10 } : { paddingLeft: 10 },
              ]}
            >
              <TouchableOpacity
                // onPress={() => tapAddress("pickup")}
                style={styles.addressStyle1}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.textStyle,
                    // curBooking.selected == "pickup"
                    //   ? { fontSize: 18 }
                    //   :
                    { fontSize: 14 },
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {curBooking && curBooking.pickup && curBooking.pickup.add
                    ? curBooking.pickup.add
                    : t("map_screen_where_input_text")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={() => tapAddress("drop")}
                style={styles.addressStyle2}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.textStyle,
                    // curBooking.selected == "drop"
                    //   ? { fontSize: 18 }
                    //   :
                    { fontSize: 14 },
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {curBooking && curBooking.drop
                    ? curBooking.drop.add
                    : t("map_screen_drop_input_text")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              width: width * 0.9,
              backgroundColor: "#f7f7f7",
              borderRadius: 15,
              marginVertical: 10,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingHorizontal: 15,
              paddingVertical: 10,
            }}
          >
            <Text
              style={[
                styles.cabText,
                {
                  fontSize: 22,
                  color: colors.BLACK,
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                },
              ]}
            >
              Modèle
            </Text>
            <View style={{ flexDirection: "row" }}>
              <View
                style={{
                  height: 20,
                  width: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  borderColor: "black",
                  borderWidth: 1,
                  borderRadius: 10,
                  marginTop: 20,
                  marginRight: 10,
                }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: colors.PRIMARY,
                    borderRadius: 5,
                  }}
                ></View>
              </View>
              <View style={{ flexDirection: "column" }}>
                <Icon
                  name="car-sports"
                  type="material-community"
                  color={colors.HEADER}
                  size={50}
                />
                <Text
                  style={[
                    styles.cabText,
                    {
                      fontSize: 14,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {curBooking && curBooking.carExtraInfo
                    ? curBooking.carExtraInfo.split(",")[0]
                    : ""}
                </Text>
              </View>
              <View style={{ flex: 1 }}></View>
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={[
                    styles.cabText,
                    {
                      fontSize: 14,
                      fontWeight: "bold",
                      color: colors.PROFILE_PLACEHOLDER_TEXT,
                    },
                  ]}
                >
                  TIME
                </Text>
                <Text
                  style={[
                    styles.cabText,
                    {
                      fontSize: 14,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {curBooking
                    ? Math.floor(curBooking.estimateTime / 60) + "min"
                    : ""}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
            }}
          >
            <View
              style={{
                width: width * 0.4,
                flexDirection: "column",
                backgroundColor: "#f7f7f7",
                borderRadius: 14,
                // justifyContent: "center",
                height: 75,
                padding: 10,
                marginRight: 10,
              }}
            >
              <Text
                style={[
                  styles.cabText,
                  {
                    fontSize: 16,
                    alignSelf: "flex-start",
                  },
                ]}
              >
                Temps du trajet
              </Text>
              <Text
                style={[
                  styles.cabText,
                  {
                    fontSize: 18,
                    fontWeight: "bold",
                    alignSelf: "flex-start",
                  },
                ]}
              >
                {curBooking
                  ? Math.floor(curBooking.estimateTime / 60) + "min"
                  : ""}
              </Text>
            </View>
            <View
              style={{
                width: width * 0.5,
                flexDirection: "column",
                backgroundColor: "#f7f7f7",
                borderRadius: 14,
                justifyContent: "center",
                height: 75,
                padding: 10,
                // alignItems:"center"
              }}
            >
              <Text
                style={[
                  styles.cabText,
                  {
                    fontSize: 16,
                    alignSelf: "flex-start",
                  },
                ]}
              >
                Prix estimé du trajet
              </Text>
              {settings.swipe_symbol === false ? (
                <Text
                  style={[
                    styles.cabText,
                    {
                      fontSize: 18,
                      fontWeight: "bold",
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  {settings.symbol +
                    parseFloat(curBooking && curBooking.estimate).toFixed(
                      settings.decimal
                    )}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.cabText,
                    {
                      fontSize: 18,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {parseFloat(
                    curBooking &&
                      curBooking.estimate &&
                      curBooking.estimate.estimateFare
                  ).toFixed(settings.decimal) + settings.symbol}
                </Text>
              )}
            </View>
          </View>
          <View
            style={{
              width: width * 0.9,
              backgroundColor: "#f7f7f7",
              borderRadius: 15,
              marginVertical: 10,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingHorizontal: 15,
              paddingVertical: 10,
            }}
          >
            <Text
              style={[
                styles.cabText,
                {
                  fontSize: 16,
                  // color: colors.BLACK,
                  // fontWeight: "bold",
                  alignSelf: "flex-start",
                },
              ]}
            >
              Date
            </Text>
            <Text
              style={[
                styles.cabText,
                {
                  fontSize: 16,
                  color: colors.BLACK,
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                },
              ]}
            >
              {moment(curBooking ? curBooking.tripdate : "").format(
                "Do MMMM YYYY"
              )}
            </Text>
          </View>
          <View
            style={{
              width: width * 0.9,
              backgroundColor: "#f7f7f7",
              borderRadius: 15,
              marginVertical: 10,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              paddingHorizontal: 15,
              paddingVertical: 10,
            }}
          >
            <Text
              style={[
                styles.cabText,
                {
                  fontSize: 16,
                  // color: colors.BLACK,
                  // fontWeight: "bold",
                  alignSelf: "flex-start",
                },
              ]}
            >
              Heure
            </Text>
            <Text
              style={[
                styles.cabText,
                {
                  fontSize: 16,
                  color: colors.BLACK,
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                },
              ]}
            >
              {moment(curBooking ? curBooking.tripdate : "").format("hh:mm")}
            </Text>
          </View>
          {renderButtons()}
        </View>
      </Modal>
      {/* {renderButtons()} */}
      {PurchaseInfoModal()}
      {UserInfoModal()}
      <CancelModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        cancelReasons={cancelReasons}
        setCancelReasonSelected={setCancelReasonSelected}
        cancelReasonSelected={cancelReasonSelected}
        curBooking={curBooking}
        setShouldVisible={setShouldVisible}
      />
      {alertModal()}
      {searchModal()}
      <OtpModal
        modalvisable={otpModalVisible}
        requestmodalclose={() => {
          setOtpModalVisible(false);
        }}
        otp={curBooking ? curBooking.otp : ""}
        onMatch={(value) =>
          value ? (appcat == "taxi" ? startBooking() : endBooking()) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: colors.WHITE },
  headerStyle: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 0,
  },
  headerInnerStyle: {
    marginLeft: 10,
    marginRight: 10,
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
  },
  topContainer: {
    flex: 1.5,
    borderTopWidth: 0,
    alignItems: "center",
    backgroundColor: colors.HEADER,
    paddingEnd: 20,
  },
  topLeftContainer: {
    flex: 1.5,
    alignItems: "center",
  },
  topRightContainer: {
    flex: 9.5,
    justifyContent: "space-between",
  },
  circle: {
    height: 15,
    width: 15,
    borderRadius: 15 / 2,
    backgroundColor: colors.LIGHT_YELLOW,
  },
  staightLine: {
    height: height / 25,
    width: 1,
    backgroundColor: colors.LIGHT_YELLOW,
  },
  square: {
    height: 17,
    width: 17,
    backgroundColor: colors.MAP_SQUARE,
  },
  whereButton: {
    flex: 1,
    justifyContent: "center",
    borderBottomColor: colors.WHITE,
    borderBottomWidth: 1,
  },
  whereContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  whereText: {
    flex: 9,
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    fontWeight: "400",
    color: colors.WHITE,
  },
  iconContainer: { flex: 1 },
  dropButton: { flex: 1, justifyContent: "center" },
  mapcontainer: {
    flex: 7,
    width: width,
  },
  bottomContainer: { flex: 6, alignItems: "center" },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  otpContainer: {
    flex: 0.8,
    backgroundColor: colors.BOX_BG,
    width: width,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cabText: {
    paddingLeft: 10,
    alignSelf: "center",
    color: colors.BLACK,
    fontFamily: "Roboto-Regular",
  },
  cabBoldText: { fontFamily: "Roboto-Bold" },
  otpText: {
    alignSelf: "center",
    color: colors.BLACK,
    fontFamily: "Roboto-Bold",
  },
  cabDetailsContainer: {
    flex: 2.5,
    backgroundColor: colors.WHITE,
    flexDirection: "row",

    // position: "relative",
    // zIndex: 1,
  },
  cabDetails: { flex: 19 },
  cabName: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cabNameText: {
    color: colors.MAP_TEXT,
    fontFamily: "Roboto-Bold",
    fontSize: 13,
  },
  cabPhoto: { flex: 1, alignItems: "center", justifyContent: "center" },
  cabImage: { width: 100, height: height / 20, marginBottom: 5, marginTop: 5 },
  cabNumber: { flex: 1, alignItems: "center", justifyContent: "center" },
  cabNumberText: {
    color: colors.BUTTON,
    fontFamily: "Roboto-Bold",
    fontSize: 13,
  },
  verticalDesign: { flex: 2, height: 50, width: 1, alignItems: "center" },
  triangle: {
    width: 20,
    height: 20,
    backgroundColor: colors.BLACK,
    borderRadius: 10,
  },
  verticalLine: {
    height: height / 18,
    width: 0.5,
    backgroundColor: colors.BLACK,
    alignItems: "center",
    marginTop: 10,
  },
  driverDetails: {
    // flex: 19,
    width: width - 40,
    alignSelf: "center",
    marginVertical: 10,
    alignItems: "center",
    // justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    height: height / 9,
  },
  driverPhotoContainer: {
    flex: 5.4,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  driverPhoto: {
    borderRadius: height / 12 / 2,
    width: height / 12,
    height: height / 12,
  },
  driverNameContainer: {
    flex: 7.6,
    // alignItems: "center",
    // justifyContent: "center",
  },
  driverNameText: { color: "#4f4e4e", fontFamily: "Roboto-Bold", fontSize: 14 },
  ratingContainer: {
    flex: 2.4,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingContainerStyle: {
    marginTop: 2,
    paddingBottom: Platform.OS == "android" ? 5 : 0,
  },

  //alert modal
  alertModalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.BACKGROUND,
  },
  alertModalInnerContainer: {
    height: 200,
    width: width * 0.85,
    backgroundColor: colors.WHITE,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 7,
  },
  alertContainer: {
    flex: 2,
    justifyContent: "space-between",
    width: width - 100,
  },
  rideCancelText: {
    flex: 1,
    top: 15,
    color: colors.BLACK,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
    alignSelf: "center",
  },
  horizontalLLine: {
    width: width - 110,
    height: 0.5,
    backgroundColor: colors.BLACK,
    alignSelf: "center",
  },
  msgContainer: { flex: 2.5, alignItems: "center", justifyContent: "center" },
  cancelMsgText: {
    color: colors.BLACK,
    fontFamily: "Roboto-Regular",
    fontSize: 15,
    alignSelf: "center",
    textAlign: "center",
  },
  okButtonContainer: {
    flex: 1,
    width: width * 0.85,
    flexDirection: "row",
    backgroundColor: colors.BUTTON,
    alignSelf: "center",
  },
  okButtonStyle: {
    flexDirection: "row",
    backgroundColor: colors.BUTTON,
    alignItems: "center",
    justifyContent: "center",
  },
  okButtonContainerStyle: {
    flex: 1,
    width: width * 0.85,
    backgroundColor: colors.BUTTON,
  },

  //cancel modal
  cancelModalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.BACKGROUND,
  },
  cancelModalInnerContainer: {
    height: 400,
    width: width * 0.85,
    padding: 0,
    backgroundColor: colors.WHITE,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 7,
  },
  cancelContainer: {
    flex: 1,
    justifyContent: "space-between",
    width: width * 0.85,
  },
  cancelReasonContainer: { flex: 1 },
  cancelReasonText: {
    top: 10,
    color: colors.BLACK,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
    alignSelf: "center",
  },
  radioContainer: { flex: 8, alignItems: "center" },
  radioText: { fontSize: 16, fontFamily: "Roboto-Medium", color: colors.BLACK },
  radioContainerStyle: { paddingTop: 30, marginLeft: 10 },
  radioStyle: { paddingBottom: 25 },
  cancelModalButtosContainer: {
    flex: 1,
    backgroundColor: colors.BUTTON,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSeparataor: {
    height: height / 35,
    width: 0.8,
    backgroundColor: colors.WHITE,
    alignItems: "center",
    marginTop: 3,
  },
  cancelModalButttonStyle: { backgroundColor: colors.BUTTON, borderRadius: 0 },
  cancelModalButtonContainerStyle: {
    flex: 1,
    width: (width * 2) / 2,
    backgroundColor: colors.BUTTON,
    alignSelf: "center",
    margin: 0,
  },
  signInTextStyle: {
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
    color: colors.WHITE,
  },
  floatButton: {
    // borderWidth: 1,
    // borderColor: colors.BLACK,
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    // position: "absolute",
    // right: 10,
    height: 50,
    backgroundColor: colors.BLACK,
    borderRadius: 25,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.BACKGROUND,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textContainerStyle: {
    flexDirection: "column",
    marginBottom: 12,
  },
  textHeading: {
    fontSize: 12,
    fontWeight: "bold",
  },
  textHeading1: {
    fontSize: 20,
    color: colors.BLACK,
  },
  textContent: {
    fontSize: 14,
    margin: 4,
  },
  textContent1: {
    fontSize: 20,
    color: colors.BUTTON_LOADING,
    padding: 5,
  },
  modalButtonStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.BUTTON_RIGHT,
    width: 100,
    height: 40,
    elevation: 0,
    borderRadius: 10,
  },
  modalButtonTextStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 18,
  },
  ballandsquare: {
    width: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  hbox1: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.GREEN_DOT,
  },
  hbox2: {
    height: 36,
    width: 1,
    backgroundColor: colors.MAP_TEXT,
  },
  hbox3: {
    height: 12,
    width: 12,
    backgroundColor: colors.DULL_RED,
    borderRadius: 6,
  },
  contentStyle: {
    justifyContent: "center",
    width: width - 74,
    height: 100,
  },
  addressStyle1: {
    // borderBottomColor: colors.BLACK,
    // borderBottomWidth: 1,
    borderColor: "#808080",
    paddingHorizontal: 10,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    width: width - 84,
    justifyContent: "center",
    paddingTop: 2,
  },
  addressStyle2: {
    marginTop: 10,
    borderColor: "#808080",
    paddingHorizontal: 10,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    width: width - 84,
    justifyContent: "center",
  },
  addressViewStyle: {
    flex: 2,
  },
  addressViewTextStyle: {
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 15,
    //marginLeft: 15,
    lineHeight: 24,
    flexWrap: "wrap",
  },
  greenDot: {
    backgroundColor: colors.GREEN_DOT,
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  menuIcon: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: colors.WHITE,
    shadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: 40,
  },
  menuIconButton: {
    flex: 1,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
});
