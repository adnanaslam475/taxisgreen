import React, { useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Icon } from "react-native-elements";
import { colors } from "../common/theme";
import i18n from "i18n-js";
import { useSelector } from "react-redux";
import SegmentedControlTab from "react-native-segmented-control-tab";
import moment from "moment/min/moment-with-locales";
import { FirebaseContext } from "common/src";
var { height, width } = Dimensions.get("window");

export default function RideList(props) {
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const { appcat } = useContext(FirebaseContext);

  const settings = useSelector((state) => state.settingsdata.settings);
  const [tabIndex, setTabIndex] = useState(props.tabIndex);

  const onPressButton = (item, index) => {
    props.onPressButton(item, index);
  };

  const renderData = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[
          styles.iconClickStyle,
          { flexDirection: isRTL ? "column-reverse" : "column" },
        ]}
        onPress={() => onPressButton(item, index)}
      >
        <View style={styles.topContainer}>
          <View style={styles.iconViewStyle}>
            {appcat == "delivery" ? (
              <Icon
                name="truck-fast"
                type="material-community"
                color={colors.BLACK}
                size={35}
              />
            ) : (
              <Icon
                name="car-sports"
                type="material-community"
                color={colors.HEADER}
                size={35}
              />
            )}
          </View>
          <View
            style={[
              styles.flexViewStyle,
              isRTL
                ? { flexDirection: "row-reverse", marginRight: 5 }
                : { flexDirection: "row", marginLeft: 5 },
            ]}
          >
            <View style={styles.textView1}>
              <Text
                style={[
                  styles.textStyle,
                  styles.dateStyle,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {item.bookingDate ? moment(item.bookingDate).format("lll") : ""}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    backgroundColor: "green",
                    width: 70,
                    height: 20,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      color: colors.WHITE,
                      fontSize: 12,
                      paddingBottom: 4,
                      textAlign: "center",
                    }}
                  >
                    {item.carExtraInfo ? item.carExtraInfo.split(",")[0] : ""}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.fareStyle,
                    styles.dateStyle,
                    {
                      //   textAlign: isRTL ? "right" : "left"
                      alignSelf: "center",
                      marginLeft: 15,
                      color: colors.PROFILE_PLACEHOLDER_TEXT,
                    },
                  ]}
                >
                  {item.status == "NEW" || item.status == "PAYMENT_PENDING"
                    ? t(item.status)
                    : null}
                </Text>
              </View>

              {/* <View
              style={[
                  isRTL
                  ? { flexDirection: "row-reverse" }
                  : { flexDirection: "row" },
                ]}
                >
                <Text
                style={[
                    styles.textStyle,
                    styles.carNoStyle,
                    { textAlign: isRTL ? "right" : "left" },
                ]}
                >
                {" "}
                {isRTL ? "-" : null} {item.carType ? item.carType : null}{" "}
                {isRTL ? null : "- "}
                </Text>
                <Text
                style={[
                    styles.textStyle,
                    styles.carNoStyle,
                    { textAlign: isRTL ? "right" : "left" },
                ]}
                >
              {item.vehicle_number
                ? item.vehicle_number
                : t("no_car_assign_text")}
                </Text>
                </View>
                <View
                style={[
                styles.picupStyle,
                styles.position,
                { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
            >
            <View style={styles.greenDot} />
            <Text
            style={[
                styles.picPlaceStyle,
                styles.placeStyle,
                isRTL
                ? { textAlign: "right", marginRight: 10 }
                : { textAlign: "left", marginLeft: 10 },
            ]}
            >
            {item.pickup ? item.pickup.add : t("not_found_text")}
            </Text>
            </View>
            <View
            style={[
                styles.dropStyle,
                styles.textViewStyle,
                { flexDirection: isRTL ? "row-reverse" : "row" },
            ]}
                >
                <View style={[styles.redDot, styles.textPosition]} />
                <Text
                style={[
                    styles.dropPlaceStyle,
                    styles.placeStyle,
                    isRTL
                    ? { textAlign: "right", marginRight: 10 }
                    : { textAlign: "left", marginLeft: 10 },
                ]}
                >
                {item.drop ? item.drop.add : t("not_found_text")}
                </Text>
            </View> */}
            </View>
            <View style={styles.textView2}>
              {settings.swipe_symbol === false ? (
                <Text
                  style={[
                    styles.fareStyle,
                    styles.dateStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {item.status == "PAID" || item.status == "COMPLETE"
                    ? item.customer_paid
                      ? settings.symbol +
                        parseFloat(item.customer_paid).toFixed(settings.decimal)
                      : settings.symbol +
                        parseFloat(item.estimate).toFixed(settings.decimal)
                    : null}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.fareStyle,
                    styles.dateStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                >
                  {item.status == "PAID" || item.status == "COMPLETE"
                    ? item.customer_paid
                      ? parseFloat(item.customer_paid).toFixed(
                          settings.decimal
                        ) + settings.symbol
                      : parseFloat(item.estimate).toFixed(settings.decimal) +
                        settings.symbol
                    : null}
                </Text>
              )}
              <Text
                style={[
                  styles.fareStyle,
                  styles.dateStyle,
                  { textAlign: isRTL ? "right" : "left" },
                ]}
              >
                {item.status == "PAID" || item.status == "COMPLETE"
                  ? Math.floor(item.total_trip_time / 60) + "m"
                  : null}
              </Text>
              {/* {item.status == "CANCELLED" ? (
                  <Image
                  style={[
                      styles.cancelImageStyle,
                      isRTL
                      ? { marginLeft: 20, alignSelf: "flex-start" }
                      : { marginRight: 20, alignSelf: "flex-end" },
                    ]}
                    source={require("../../assets/images/cancel.png")}
                    />
                ) : null} */}
            </View>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#b3bbb7",
            margin: 20,
          }}
        >
        {/* <View style={{ flexDirection: "row" }}> */}
              <View style={styles.ballandsquare}>
                <View style={styles.hbox1} />
                {/* <View style={styles.hbox2} /> */}
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
                      // tripdata.selected == "pickup"
                      //   ? { fontSize: 18 }
                      //   :
                      { fontSize: 14 },
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {item
                      ? item.pickup.add
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
                      // tripdata.selected == "drop"
                      //   ? { fontSize: 18 }
                      //   :
                      { fontSize: 14 },
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                  >
                    {item
                      ? item.drop.add
                      : t("map_screen_drop_input_text")}
                  </Text>
                </TouchableOpacity>
              </View>
            {/* </View> */}
          {/* <View style={[styles.addressBar, { flexDirection: "row" }]}> */}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.textView3}>
      <SegmentedControlTab
        values={[t("active_booking"), t("COMPLETE"), t("CANCELLED")]}
        selectedIndex={tabIndex}
        onTabPress={(index) => setTabIndex(index)}
        borderRadius={0}
        tabsContainerStyle={styles.segmentcontrol}
        tabStyle={{
          borderWidth: 0,
          backgroundColor: "#DEE4E7",
          borderBottomWidth: 0,
          borderBottomColor: colors.BACKGROUND_PRIMARY,
        }}
        activeTabStyle={{
          borderBottomColor: colors.BACKGROUND,
          backgroundColor: "#DEE4E7",
          borderBottomWidth: 0,
        }}
        tabTextStyle={{ color: colors.RIDELIST_TEXT, fontWeight: "bold" }}
        activeTabTextStyle={{ color: colors.BLACK, borderBottomWidth: 2 }}
      />
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={
          tabIndex === 0
            ? props.data.filter(
                (item) =>
                  !(item.status === "CANCELLED" || item.status === "COMPLETE")
              )
            : tabIndex === 1
            ? props.data.filter((item) => item.status === "COMPLETE")
            : props.data.filter((item) => item.status === "CANCELLED")
        }
        renderItem={renderData}
        style={{
          marginTop: 14,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 18,
  },
  fareStyle: {
    fontSize: 18,
  },
  // carNoStyle: {
  //     marginLeft: 45,
  //     fontSize: 13,
  //     marginTop: 10
  // },
  picupStyle: {
    flexDirection: "row",
  },
  picPlaceStyle: {
    color: colors.RIDELIST_TEXT,
  },
  dropStyle: {
    flexDirection: "row",
  },
  drpIconStyle: {
    color: colors.RED,
    fontSize: 20,
  },
  dropPlaceStyle: {
    color: colors.RIDELIST_TEXT,
  },
  greenDot: {
    alignSelf: "center",
    borderRadius: 10,
    width: 10,
    height: 10,
    backgroundColor: colors.GREEN_DOT,
  },
  redDot: {
    borderRadius: 10,
    width: 10,
    height: 10,
    backgroundColor: colors.RED,
  },
  logoStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconClickStyle: {
    flex: 1,
  },
  topContainer: {
    flex: 1,
    backgroundColor: "#DEE4E7",
    height: 70,
    flexDirection: "row",
    marginHorizontal: 5,
    marginVertical: 5,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#b3bbb7",
  },
  flexViewStyle: {
    flex: 7,
    flexDirection: "row",
    // borderBottomColor: colors.RIDELIST_TEXT,
    // borderBottomWidth: 1,
  },
  dateStyle: {
    fontFamily: "Roboto-Bold",
    color: colors.HEADER,
  },
  carNoStyle: {
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    marginTop: 8,
    color: colors.HEADER,
  },
  placeStyle: {
    fontFamily: "Roboto-Regular",
    fontSize: 16,
    alignSelf: "center",
  },
  textViewStyle: {
    marginTop: 10,
    marginBottom: 10,
  },
  cancelImageStyle: {
    width: 50,
    height: 50,
    marginTop: 18,
  },
  iconViewStyle: {
    flex: 1,
    marginTop: 10,
  },
  textView1: {
    flex: 5,
  },
  textView2: {
    flex: 2,
  },
  textView3: {
    flex: 1,
  },
  position: {
    marginTop: 20,
  },
  textPosition: {
    alignSelf: "center",
  },
  segmentcontrol: {
    color: colors.WHITE,
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    marginTop: 0,
    alignSelf: "center",
    height: 50,
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
  textStyle: {
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    color: "#000",
  },
});
