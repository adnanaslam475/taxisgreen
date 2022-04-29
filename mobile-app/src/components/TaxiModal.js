import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Image,
  Animated,
  ScrollView,
} from "react-native";
import { Icon, Button, Header } from "react-native-elements";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { colors } from "../common/theme";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
import OptionsModal from "./OptionsModal";
var { width, height } = Dimensions.get("window");

import i18n from "i18n-js";
import PaymentMethodsModal from "./PaymentMethodsModal";

export default function taxiModal(props) {
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const {
    settings,
    tripdata,
    estimate,
    bookingModalStatus,
    onPressCancel,
    bookNow,
    allCarTypes,
    selectCarType,
    onPressBook,

    carSelected,
    setCarSelected,
    setOptions,
    paymentMethodModalId,
    setPaymentMethodModalId,
    redirectToAddCard,
  } = props;

  useEffect(() => {
    selectCarType(allCarTypes[0]);
  }, []);

  const [optionsModalStatus, setOptionsModalStatus] = React.useState(false);
  const [PaymentMethodsModalStatus, setPaymentMethodsModalStatus] =
    React.useState(false);
  const [optionsModalData, setOptionsModalData] = React.useState([]);
  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const lCom = {
    icon: "ios-arrow-back",
    type: "ionicon",
    color: colors.BLACK,
    size: 35,
    component: TouchableWithoutFeedback,
    onPress: onPressCancel,
  };

  useEffect(() => {
    if (carSelected) {
      onPressBook();
      setCarSelected(false);
    }
  }, [carSelected]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={bookingModalStatus}
      //   onShow={runFitCoords}
    >
      <View style={styles.container}>
        <Header
          placement="left"
          backgroundColor={colors.PRIMARY}
          leftComponent={lCom}
          centerComponent={
            <View style={{ flexDirection: "row" }}>
              <Icon
                name="map-pin"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                style={{ marginLeft: 37 }}
              />
              <Text
                style={{
                  marginHorizontal: 7,
                  textAlign: "center",
                  color: colors.PRIMARY,
                  fontFamily: "Roboto-Bold",
                  fontSize: 22,
                }}
              >
                {t("book_your_ride_menu")}
              </Text>
            </View>
          }
          containerStyle={styles.headerContainerStyle}
          innerContainerStyles={styles.headerInnerContainer}
        />
        {/* <View style={{ flex: 1 }}></View> */}
        <View style={styles.mapcontainer}>
          <Text style={styles.newHeading}>
            Choisissez la catégorie ou le véhicule le plus proche, selon vos
            besoins
          </Text>
          <Text style={[styles.newHeading, { fontSize: 24, marginTop: 10 }]}>
            Prix estimé
          </Text>
          <View style={styles.iconContainer}>
            {settings.swipe_symbol === false ? (
              <Text style={styles.priceText}>
                {" "}
                {settings ? settings.symbol : null}{" "}
                {estimate ? estimate.estimateFare : null}
              </Text>
            ) : (
              <Text style={styles.priceText}>
                {" "}
                {estimate ? estimate.estimateFare : null}{" "}
                {settings ? settings.symbol : null}
              </Text>
            )}
          </View>
          {/* <Animated.View
            style={{
              alignItems: "center",
              backgroundColor: colors.BACKGROUND_PRIMARY,
              flex: animation,
              marginTop: 10,
            }}
          > */}

          <RadioForm
            // initial={0}
            formHorizontal={false}
            labelHorizontal={true}
            labelStyle={{ marginLeft: 0 }}
          >
            {allCarTypes.map((obj, i) => {
              return (
                <RadioButton
                  labelHorizontal={true}
                  key={i}
                  style={{
                    flexDirection: isRTL ? "row-reverse" : "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <RadioButtonInput
                    buttonSize={10}
                    buttonOuterSize={20}
                    obj={obj}
                    index={i}
                    isSelected={obj.active}
                    onPress={() => {
                      selectCarType(obj);
                    }}
                    buttonColor={colors.PRIMARY}
                    labelColor={colors.BLACK}
                    selectedButtonColor={colors.PRIMARY}
                    selectedLabelColor={colors.BLACK}
                  />

                  <TouchableOpacity style={[styles.carContainer]} key={i}>
                    <View style={{ flexDirection: "column" }}>
                      <Image
                        source={
                          obj.image
                            ? { uri: obj.image }
                            : require("../../assets/images/microBlackCar.png")
                        }
                        resizeMode="contain"
                        style={styles.cardItemImagePlace}
                      ></Image>

                      <Text style={styles.titleStyles}>
                        {obj.extra_info.split()[0].split(",")[1].split(":")[1]}
                        {"\n"}
                        {obj.extra_info.split()[0].split(",")[0]}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "column" }}>
                      <Text style={[styles.text2]}>Time</Text>
                      <Text
                        style={[
                          styles.text2,
                          {
                            color: "#000",
                            fontFamily: "Roboto-Bold",
                            fontSize: 12,
                          },
                        ]}
                      >
                        ({obj.minTime != "" ? obj.minTime : t("not_available")})
                      </Text>
                    </View>
                  </TouchableOpacity>
                </RadioButton>
              );
            })}
          </RadioForm>
          <View style={{ flex: 1 }}></View>

          {/* </Animated.View> */}
          {/* {tripdata && tripdata.pickup && tripdata.drop ? (
            <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: tripdata.pickup.lat,
              longitude: tripdata.pickup.lng,
              latitudeDelta: 0.9922,
              longitudeDelta: 1.9421,
            }}
            >
              <Marker
                coordinate={{
                  latitude: tripdata.pickup.lat,
                  longitude: tripdata.pickup.lng,
                }}
                title={tripdata.pickup.add}
                pinColor={colors.GREEN_DOT}
              ></Marker>

              <Marker
                coordinate={{
                  latitude: tripdata.drop.lat,
                  longitude: tripdata.drop.lng,
                }}
                title={tripdata.drop.add}
              ></Marker>

              {estimate && estimate.waypoints ? (
                <MapView.Polyline
                  coordinates={estimate.waypoints}
                  strokeWidth={5}
                  strokeColor={colors.INDICATOR_BLUE}
                  lineDashPattern={[1]}
                />
              ) : null}
            </MapView>
          ) : null} */}
        </View>
        <View style={[styles.bottomContainer]}>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={() => setOptionsModalStatus(true)}>
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={require("../../assets/images/options-horizontal-solid.png")}
                  style={{
                    width: 30,
                    height: 30,
                    tintColor: colors.PRIMARY,
                  }}
                ></Image>
                <Text
                  style={[
                    styles.text2,
                    {
                      fontSize: 18,
                      marginLeft: 12,

                      fontWeight: "bold",
                      padding: 2,
                      color: colors.PRIMARY,
                    },
                  ]}
                >
                  {"Option"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setPaymentMethodsModalStatus(true);
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={require("../../assets/images/512px-Money_font_awesome.png")}
                  style={{
                    width: 30,
                    height: 30,
                    marginLeft: 12,
                    tintColor: colors.PRIMARY,
                  }}
                ></Image>
                <Text
                  style={[
                    styles.text2,
                    {
                      fontSize: 18,
                      marginLeft: 12,

                      fontWeight: "bold",
                      color: colors.PRIMARY,
                    },
                  ]}
                >
                  {"Mode Paiement"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Button
            onPress={() => {
              if (optionsModalData.length === 0) {
                setError(true);
                setErrorMessage("Veuillez choisir au moins une option");
                return;
              } else if (paymentMethodModalId.length === 0) {
                setError(true);
                setErrorMessage("Un mode de paiement doit être sélectionné");
                return;
              } else {
                setOptions(optionsModalData);
                onPressCancel();
              }
            }}
            title={"Valider"}
            // loading={props.loading}
            titleStyle={styles.buttonTitle}
            buttonStyle={styles.registerButton}
          />
          {error && (
            <Text
              style={[
                styles.text2,
                {
                  color: "red",
                },
              ]}
            >
              {errorMessage}
            </Text>
          )}
          <OptionsModal
            optionsModalStatus={optionsModalStatus}
            setOptionsModalData={setOptionsModalData}
            setOptionsModalStatus={setOptionsModalStatus}
          />
          <PaymentMethodsModal
            PaymentMethodsModalStatus={PaymentMethodsModalStatus}
            setPaymentMethodModalId={setPaymentMethodModalId}
            setPaymentMethodsModalStatus={setPaymentMethodsModalStatus}
            paymentMethodModalId={paymentMethodModalId}
            redirectToAddCard={redirectToAddCard}
            onPressCancel={onPressCancel}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  carContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: width / 1.5,
    height: 80,
    marginBottom: 5,
    marginLeft: 15,
    marginRight: 15,
    backgroundColor: colors.WHITE,
    // borderRadius: 6,
    // borderWidth: 1,
    // borderColor: colors.BORDER_BACKGROUND,
  },
  headerContainerStyle: {
    backgroundColor: colors.TRANSPARENT,
    borderBottomWidth: 0,
    marginTop: 0,
  },
  headerInnerContainer: {
    marginLeft: 10,
    marginRight: 10,
  },

  container: {
    flex: 1,
    backgroundColor: colors.WHITE,

    //marginTop: StatusBar.currentHeight
  },
  topContainer: {
    flex: 1.5,
    flexDirection: "row",
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
    height: 12,
    width: 12,
    borderRadius: 15 / 2,
    backgroundColor: colors.LIGHT_YELLOW,
  },
  staightLine: {
    height: height / 25,
    width: 1,
    backgroundColor: colors.LIGHT_YELLOW,
  },
  square: {
    height: 14,
    width: 14,
    backgroundColor: colors.FOOTERTOP,
  },
  whereButton: {
    flex: 1,
    justifyContent: "center",
    borderBottomColor: colors.WHITE,
    borderBottomWidth: 1,
  },
  whereContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  whereText: {
    flex: 9,
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    fontWeight: "400",
    color: colors.WHITE,
  },
  iconContainer: { flex: 1, marginBottom: 30 },
  dropButton: { flex: 1, justifyContent: "center" },
  mapcontainer: {
    flex: 7,
    width: width - 60,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  bottomContainer: {
    flex: 2,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    justifyContent: "flex-end",
    borderTopColor: "#DEE4E7",
    borderTopWidth: 1,
  },
  offerContainer: {
    flex: 1,
    backgroundColor: colors.Box_BG,
    width: width,
    justifyContent: "center",
    borderBottomColor: colors.BUTTON_YELLOW,
    borderBottomWidth: Platform.OS == "ios" ? 1 : 0,
  },
  offerText: {
    alignSelf: "center",
    color: colors.MAP_TEXT,
    fontSize: 12,
    fontFamily: "Roboto-Regular",
  },
  newHeading: {
    alignSelf: "center",
    color: colors.PROFILE_PLACEHOLDER_TEXT,
    fontSize: 18,
    fontFamily: "Roboto-Regular",
  },
  priceDetailsContainer: {
    flex: 2.3,
    backgroundColor: colors.WHITE,
    flexDirection: "row",
    position: "relative",
    zIndex: 1,
  },
  priceDetailsLeft: { flex: 19 },
  priceDetailsMiddle: { flex: 2, height: 50, width: 1, alignItems: "center" },
  priceDetails: { flex: 1, flexDirection: "row" },
  totalFareContainer: {
    flex: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  totalFareText: {
    color: colors.MAP_TEXT,
    fontFamily: "Roboto-Bold",
    fontSize: 15,
    marginLeft: 40,
  },
  infoIcon: { flex: 2, alignItems: "center", justifyContent: "center" },
  priceText: {
    alignSelf: "center",
    color: colors.BUTTON,
    fontFamily: "Roboto-Bold",
    fontSize: 26,
    color: colors.PRIMARY,
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
    borderBottomColor: colors.Box_BG,
    transform: [{ rotate: "180deg" }],
    marginTop: -1,
    overflow: "visible",
  },
  lineHorizontal: {
    height: height / 18,
    width: 1,
    backgroundColor: colors.BLACK,
    alignItems: "center",
    marginTop: 10,
  },
  logoContainer: { flex: 19, alignItems: "center", justifyContent: "center" },
  logoImage: { width: 80, height: 80 },
  buttonsContainer: { flex: 1.5, flexDirection: "row" },
  buttonText: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 17,
    alignSelf: "flex-end",
  },
  buttonStyle: { backgroundColor: colors.DRIVER_TRIPS_TEXT, elevation: 0 },
  buttonContainerStyle: { flex: 1, backgroundColor: colors.DRIVER_TRIPS_TEXT },
  confirmButtonStyle: { backgroundColor: colors.BUTTON_RIGHT, elevation: 0 },
  confirmButtonContainerStyle: {
    flex: 1,
    backgroundColor: colors.BUTTON_RIGHT,
  },

  flexView: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  cardItemImagePlace: {
    width: 20,
    height: 15,
    margin: 5,
    borderRadius: 2.5,
  },
  cardItemImagePlace: {
    width: 60,
    height: 50,
    margin: 10,
    borderRadius: 5,
  },
  bodyContent: {
    flex: 1,
  },
  titleStyles: {
    fontSize: 12,
    color: colors.HEADER,
    // paddingBottom: 2,
    fontWeight: "bold",
  },
  text2: {
    fontFamily: "Roboto-Regular",
    fontSize: 11,
    fontWeight: "900",
    color: colors.BORDER_TEXT,
  },
  registerButton: {
    backgroundColor: "#72C048",
    width: width * 0.7,
    height: 45,
    borderColor: colors.TRANSPARENT,
    borderWidth: 0,
    marginTop: 30,
    borderRadius: 24,
  },
  buttonTitle: {
    fontSize: 16,
  },
});
