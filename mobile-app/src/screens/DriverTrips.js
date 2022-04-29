import React, { useEffect, useState, useContext } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Modal,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Switch,
  Image,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Button, Icon, Header } from "react-native-elements";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { colors } from "../common/theme";
import i18n from "i18n-js";
import { useDispatch, useSelector } from "react-redux";
import { FirebaseContext } from "common/src";
import { Alert } from "react-native";
import moment from "moment/min/moment-with-locales";
import carImageIcon from "../../assets/images/track_Car.png";
import * as Location from "expo-location";

var { width, height } = Dimensions.get("window");

export default function DriverTrips(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const { acceptTask, cancelTask, updateProfile } = api;
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.taskdata.tasks);
  const settings = useSelector((state) => state.settingsdata.settings);
  const auth = useSelector((state) => state.auth);
  const bookinglistdata = useSelector((state) => state.bookinglistdata);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [region, setRegion] = useState(null);
  const gps = useSelector((state) => state.gpsdata);
  const latitudeDelta = 0.0922;
  const longitudeDelta = 0.0421;
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const [displayCurrentAddress, setDisplayCurrentAddress] = useState(
    "Wait, we are fetching you location..."
  );

  useEffect(() => {
    if (bookinglistdata.bookings) {
      setActiveBookings(
        bookinglistdata.bookings.filter(
          (booking) =>
            booking.status == "ACCEPTED" ||
            booking.status == "ARRIVED" ||
            booking.status == "STARTED" ||
            booking.status == "REACHED"
        )
      );
    }
  }, [bookinglistdata.bookings]);

  const onPressAccept = (item) => {
    let wallet_balance = parseFloat(auth.info.profile.walletBalance);
    if (!settings.negativeBalance && wallet_balance <= 0) {
      Alert.alert(t("alert"), t("wallet_balance_zero"));
    } else if (
      !settings.negativeBalance &&
      wallet_balance > 0 &&
      wallet_balance < item.convenience_fees
    ) {
      Alert.alert(t("alert"), t("wallet_balance_low"));
    } else {
      dispatch(acceptTask(auth.info, item));
      setSelectedItem(null);
      setModalVisible(null);
      setTimeout(() => {
        props.navigation.navigate("BookedCab", { bookingId: item.id });
      }, 3000);
    }
  };

  const onPressIgnore = (id) => {
    dispatch(cancelTask(id));
    setSelectedItem(null);
    setModalVisible(null);
  };

  const goToBooking = (id) => {
    props.navigation.navigate("BookedCab", { bookingId: id });
  };

  const onChangeFunction = () => {
    if (
      !(auth && auth.info && auth.info.profile && auth.info.profile.approved)
    ) {
      Alert.alert(t("alert"), t("require_approval"));
    } else {
      let res = !auth.info.profile.driverActiveStatus;
      dispatch(updateProfile(auth.info, { driverActiveStatus: res }));
    }
  };

  useEffect(() => {
    if (gps.location) {
      if (gps.location.lat && gps.location.lng) {
        setRegion({
          latitude: gps.location.lat,
          longitude: gps.location.lng,
          latitudeDelta: latitudeDelta,
          longitudeDelta: longitudeDelta,
        });
      }
    }
  }, [gps.location]);

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
  function myFunction(item) {
    const reverseGeocodeAsync = async () => {
      let response = await Location.reverseGeocodeAsync({
        latitude: item.pickup.lat,
        longitude: item.pickup.lng,
      });
      setDisplayCurrentAddress(
        `${response[0].street}, ${response[0].postalCode}, ${response[0].city}`
      );
    };
    reverseGeocodeAsync();
    return `${displayCurrentAddress}`;
  }
  const goBack = (item) => {
    setModalVisible(true);
    setSelectedItem(item);
  };
  return (
    <View style={styles.mainViewStyle}>
      <FlatList
        data={
          auth.info && auth.info.profile && auth.info.profile.driverActiveStatus
            ? auth.info.profile.queue
              ? activeBookings
              : tasks
            : []
        }
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          auth.info &&
          auth.info.profile &&
          auth.info.profile.driverActiveStatus ? (
            <View style={{ flex: 1 }}>
              {region ? (
                <View style={{ flex: 1 }}>
                  <MapView
                    region={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                      latitudeDelta: latitudeDelta,
                      longitudeDelta: longitudeDelta,
                    }}
                    provider={PROVIDER_GOOGLE}
                    style={{
                      // height: height - (Platform.OS == "android" ? 15 : 60),
                      width: width,
                      height: height,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: region.latitude,
                        longitude: region.longitude,
                      }}
                      pinColor={colors.HEADER}
                      image={require("../../assets/images/gps-arrow.png")}
                    ></Marker>
                  </MapView>
                  <View style={{ position: "absolute", bottom: 0, left: 25 }}>
                    <Button
                      title={"Hors Ligne"}
                      titleStyle={styles.buttonTitle}
                      onPress={onChangeFunction}
                      buttonStyle={{
                        width: width * 0.9,
                        height: height * 0.09,
                        borderRadius: 10,
                        backgroundColor: colors.PRIMARY,
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                    width: width,
                  }}
                >
                  <Text>{t("location_permission_error")}</Text>
                </View>
              )}

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
                        color: "#FFF",
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
          ) : (
            <View style={{ height: height, width: width }}>
              {region ? (
                <View>
                  <MapView
                    region={{
                      latitude: region.latitude,
                      longitude: region.longitude,
                      latitudeDelta: latitudeDelta,
                      longitudeDelta: longitudeDelta,
                    }}
                    provider={PROVIDER_GOOGLE}
                    style={{
                      // height: height - (PFlatform.OS == "android" ? 15 : 60),
                      width: width,
                      height: height * 0.9,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: region.latitude,
                        longitude: region.longitude,
                      }}
                      pinColor={colors.HEADER}
                      image={require("../../assets/images/gps-arrow.png")}
                    ></Marker>
                  </MapView>
                  <View style={{ position: "absolute", bottom: 100, left: 25 }}>
                    <Button
                      title={"Passer en ligne"}
                      titleStyle={[styles.buttonTitle]}
                      onPress={onChangeFunction}
                      buttonStyle={{
                        width: width * 0.9,
                        height: height * 0.09,
                        borderRadius: 10,
                        backgroundColor: colors.PRIMARY,
                      }}
                    />
                  </View>
                  <View style={styles.btmContainer}>
                    <Icon
                      name="wifi-off"
                      type="MaterialCommunityIcons"
                      // color="#517fa4"
                      size={50}
                    />
                    <View
                      style={{
                        flexDirection: "column",
                        justifyContent: "center",
                        paddingLeft: 20,
                      }}
                    >
                      <Text style={{ color: colors.BLACK, fontSize: 16 }}>
                        vous êtes hors ligne
                      </Text>
                      <Text
                        style={{
                          color: colors.PROFILE_PLACEHOLDER_CONTENT,
                          fontSize: 14,
                        }}
                      >
                        passez en ligne pour commencer
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: height,
                    width: width,
                  }}
                >
                  <Text>{t("location_permission_error")}</Text>
                </View>
              )}

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
                  {
                    left: "30%",
                    width: 150,
                    backgroundColor: colors.LIGHT_RED,
                  },
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
                        color: "#FFF",
                      },
                    ]}
                  >
                    HORS LIGNE
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
          )
        }
        renderItem={({ item, index }) => {
          return (
            <View style={styles.listItemView}>
              <Header
                backgroundColor={colors.WHITE}
                leftComponent={
                  isRTL
                    ? null
                    : {
                        icon: "ios-arrow-back",
                        type: "ionicon",
                        color: colors.BLACK,
                        size: 30,
                        component: TouchableWithoutFeedback,
                        onPress: () => {
                          props.navigation?.toggleDrawer();
                        },
                      }
                }
                centerComponent={
                  <Text style={styles.headerTitleStyle}>Demande</Text>
                }
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
              />
              <View style={styles.mapDetails}>
                <View style={styles.clientDetails}>
                  <View style={styles.clientDetailsInner}>
                    <Image
                      source={
                        item
                          ? item.customer_image
                            ? item.customer_image
                            : require("../../assets/images/profilePic.png")
                          : null
                      }
                      style={{ width: 75, height: 75 }}
                    />
                    <View style={styles.clientDetailsInnerRight}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: colors.PROFILE_PLACEHOLDER_TEXT,
                        }}
                      >
                        Client
                      </Text>
                      <Text
                        style={{
                          fontSize: 24,
                          color: colors.BLACK,
                          fontWeight: "bold",
                        }}
                      >
                        {item ? item.customer_name : null}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.moreDetailsContainer}>
                  <View style={styles.moreDetailsLeftContainer}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: colors.PROFILE_PLACEHOLDER_CONTENT,
                        fontWeight: "bold",
                      }}
                    >
                      {item && item.bookLater
                        ? t("reserve_later")
                        : t("reserve_now")}
                    </Text>
                    <Text
                      style={[
                        {
                          fontSize: 30,
                          color: colors.BLACK,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {moment(item && item.tripdate).format("hh:mm")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.moreDetailsLeftContainer,
                      {
                        borderRightWidth: 0,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: colors.PROFILE_PLACEHOLDER_CONTENT,
                        fontWeight: "bold",
                      }}
                    >
                      Mode paiement
                    </Text>
                    <View
                      style={{
                        width: 120,
                        height: 30,
                        borderRadius: 5,
                        backgroundColor: "#EBFAE9",
                      }}
                    >
                      <Text
                        style={[
                          {
                            fontSize: 14,
                            color: colors.PRIMARY,
                            fontWeight: "bold",
                            textAlign: "center",
                          },
                        ]}
                      >
                        {item
                          ? item.paymentMethodModalId === "COD"
                            ? "Paiement à bord CB/Espèces"
                            : "carte de crédit"
                          : null}
                      </Text>
                    </View>
                  </View>
                </View>
                {activeBookings && activeBookings.length >= 1 ? (
                  <View style={styles.detailsBtnView}>
                    <View style={{ flex: 1 }}>
                      <Button
                        onPress={() => {
                          goToBooking(item.id);
                        }}
                        title={t("go_to_booking")}
                        titleStyle={styles.titleStyles}
                        buttonStyle={{
                          backgroundColor: colors.DRIVER_TRIPS_BUTTON,
                          width: 180,
                          height: 50,
                          padding: 2,
                          borderColor: colors.TRANSPARENT,
                          borderWidth: 0,
                          borderRadius: 5,
                        }}
                        containerStyle={{
                          flex: 1,
                          alignSelf: "center",
                          paddingRight: 14,
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.detailsBtnView,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Button
                      onPress={() => {
                        setModalVisible(true);
                        setSelectedItem(item);
                      }}
                      title={"Refuser"}
                      titleStyle={styles.titleStyles}
                      buttonStyle={[styles.myButtonStyle]}
                    />
                    <Button
                      title={"Accepter"}
                      titleStyle={styles.titleStyles}
                      onPress={() => {
                        onPressAccept(item);
                      }}
                      buttonStyle={{
                        backgroundColor: colors.DRIVER_TRIPS_BUTTON,
                        width: height / 5,
                        padding: 2,
                        borderColor: colors.TRANSPARENT,
                        borderWidth: 0,
                        borderRadius: 10,
                        height: height / 14,
                      }}
                    />
                  </View>
                )}
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
                      marginVertical: 10,
                      paddingHorizontal: 20,
                      paddingVertical: 20,
                      backgroundColor: "#f7f7f7",
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
                        Depart
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
                      {myFunction(item)}
                    </Text>
                  </View>
                </View>
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
                      marginVertical: 10,
                      paddingHorizontal: 20,
                      paddingVertical: 20,
                      backgroundColor: "#f7f7f7",
                    }}
                  >
                    <Text
                      style={[
                        styles.addressViewTextStyle,
                        isRTL ? { marginRight: 10 } : { marginLeft: 10 },
                        { textAlign: isRTL ? "right" : "left" },
                      ]}
                    >
                      Options
                    </Text>
                    <View
                      style={{
                        flexDirection: isRTL ? "row" : "row-reverse",
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "flex-start",
                      }}
                    >
                      {item &&
                        item.options &&
                        item.options.length > 0 &&
                        item.options.map((option, index) => {
                          return (
                            <View
                              style={{
                                width: 80,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: "#fff",
                                marginHorizontal: 5,
                                marginVertical: 5,
                                // alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  // fontWeight: "bold",
                                  color: colors.PROFILE_PLACEHOLDER_CONTENT,
                                  textAlign: "center",
                                }}
                              >
                                {option}
                              </Text>
                            </View>
                          );
                        })}
                    </View>
                  </View>
                </View>
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>
                      {t("parcel_type")} -{" "}
                    </Text>
                    <Text style={styles.textContent}>
                      {item && item.parcelTypeSelected
                        ? item.parcelTypeSelected.description
                        : ""}
                    </Text>
                  </View>
                ) : null}
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>{t("options")} - </Text>
                    <Text style={styles.textContent}>
                      {item && item.optionSelected
                        ? item.optionSelected.description
                        : ""}
                    </Text>
                  </View>
                ) : null}
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle2,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>
                      {t("pickUpInstructions")}
                    </Text>
                    <Text style={styles.textContent2}>
                      {item ? item.pickUpInstructions : ""}
                    </Text>
                  </View>
                ) : null}
                {appcat == "delivery" ? (
                  <View
                    style={[
                      styles.textContainerStyle2,
                      { flexDirection: isRTL ? "row-reverse" : "row" },
                    ]}
                  >
                    <Text style={styles.textHeading}>
                      {t("deliveryInstructions")}
                    </Text>
                    <Text style={styles.textContent2}>
                      {item ? item.deliveryInstructions : ""}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
      />

      <View style={styles.modalPage}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert(t("modal_close"));
          }}
        >
          <View style={styles.modalMain}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeading}>
                <Text style={styles.alertStyle}>{t("alert_text")}</Text>
              </View>
              <View style={styles.modalBody}>
                <Text style={{ fontSize: 16 }}>{t("ignore_job_title")}</Text>
              </View>
              <View
                style={[
                  styles.modalFooter,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
              >
                <TouchableHighlight
                  style={
                    isRTL
                      ? [styles.btnStyle]
                      : [styles.btnStyle, styles.clickText]
                  }
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    setSelectedItem(null);
                  }}
                >
                  <Text style={styles.cancelTextStyle}>{t("cancel")}</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  style={
                    isRTL
                      ? [styles.btnStyle, styles.clickText]
                      : [styles.btnStyle]
                  }
                  onPress={() => {
                    onPressIgnore(selectedItem && selectedItem.id);
                  }}
                >
                  <Text style={styles.okStyle}>{t("ok")}</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

//Screen Styling
const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 0,
  },
  headerInnerStyle: {
    marginLeft: 10,
    marginRight: 10,
  },
  headerTitleStyle: {
    color: colors.BLACK,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
  },
  mapcontainer: {
    flex: 1.5,
    width: width,
    height: 200,
    borderWidth: 7,
    borderColor: colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  mapDetails: {
    backgroundColor: colors.WHITE,
    flex: 1,
    flexDirection: "column",
  },
  clientDetails: {
    backgroundColor: "#F7F7F7",
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  clientDetailsInner: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  clientDetailsInnerRight: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginLeft: 10,
  },
  moreDetailsContainer: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 10,
    marginVertical: 10,
    borderTopColor: "#F7F7F7",
    borderTopWidth: 1,
    borderBottomColor: "#F7F7F7",
    borderBottomWidth: 1,
  },
  moreDetailsLeftContainer: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRightColor: "#F7F7F7",
    borderRightWidth: 1,
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: colors.TRANSPARENT,
    borderStyle: "solid",
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 10,
    borderLeftColor: colors.TRANSPARENT,
    borderRightColor: colors.TRANSPARENT,
    borderBottomColor: colors.BOX_BG,
    transform: [{ rotate: "180deg" }],
  },
  signInTextStyle: {
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
    color: colors.WHITE,
  },
  listItemView: {
    flex: 1,
    width: "100%",
    // height: 350,
    marginBottom: 10,
    flexDirection: "column",
  },
  dateView: {
    flex: 1.1,
  },
  listDate: {
    fontSize: 20,
    fontWeight: "bold",
    paddingLeft: 10,
    color: colors.BLACK,
    flex: 1,
    alignSelf: "center",
  },
  estimateView: {
    flex: 1.1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  listEstimate: {
    fontSize: 20,
    color: colors.DRIVER_TRIPS_TEXT,
  },
  addressViewStyle: {
    flex: 2,
  },
  no_driver_style: {
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 18,
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
  redDot: {
    backgroundColor: colors.RED,
    width: 10,
    height: 10,
    borderRadius: 50,
  },
  detailsBtnView: {
    flex: 2,
    justifyContent: "center",
    width: width,
    marginTop: 20,
    marginBottom: 20,
  },

  modalPage: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMain: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: colors.WHITE,
    borderRadius: 10,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 15,
    flex: 1,
    maxHeight: 180,
  },
  modalHeading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalFooter: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    borderTopColor: colors.FOOTERTOP,
    borderTopWidth: 1,
    width: "100%",
  },
  btnStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainViewStyle: {
    flex: 1,
    backgroundColor: colors.WHITE,
    //marginTop: StatusBar.currentHeight
  },
  myButtonStyle: {
    backgroundColor: colors.RED,
    width: height / 5,
    padding: 2,
    borderColor: colors.TRANSPARENT,
    borderWidth: 0,
    borderRadius: 5,
    height: height / 14,
    marginHorizontal: 10,
  },
  alertStyle: {
    fontWeight: "bold",
    fontSize: 18,
    width: "100%",
    textAlign: "center",
  },
  cancelTextStyle: {
    color: colors.INDICATOR_BLUE,
    fontSize: 18,
    fontWeight: "bold",
    width: "100%",
    textAlign: "center",
  },
  okStyle: {
    color: colors.INDICATOR_BLUE,
    fontSize: 18,
    fontWeight: "bold",
  },
  viewFlex1: {
    flex: 1,
  },
  clickText: {
    borderRightColor: colors.DRIVER_TRIPS_TEXT,
    borderRightWidth: 1,
  },
  titleStyles: {
    width: "100%",
    alignSelf: "center",
  },
  rateViewStyle: {
    alignItems: "center",
    flex: 2,
    marginTop: 10,
    marginBottom: 10,
  },
  rateViewTextStyle: {
    fontSize: 50,
    color: colors.BLACK,
    fontFamily: "Roboto-Bold",
    fontWeight: "bold",
    textAlign: "center",
  },
  textContainerStyle: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginLeft: 35,
    marginRight: 35,
    marginTop: 10,
  },
  textContainerStyle2: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 35,
    marginRight: 35,
    marginTop: 10,
  },
  textHeading: {
    fontWeight: "bold",
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 15,
  },
  textContent: {
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 15,
    marginLeft: 3,
  },
  textContent2: {
    marginTop: 4,
    color: colors.DRIVER_TRIPS_TEXT,
    fontSize: 15,
  },
  btmContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 20,
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
    // top: hasNotch ? 40 : 20,
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
  registerButton: {
    backgroundColor: "#72C048",
    width: width * 0.8,
    height: 50,
    borderColor: colors.TRANSPARENT,
    borderWidth: 0,
    marginTop: 30,
    borderRadius: 24,
  },
  buttonTitle: {
    fontSize: 16,
  },
});
