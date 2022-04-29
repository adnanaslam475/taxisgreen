import React, { useEffect, useState } from "react";
import { RideList } from "../components";
import { StyleSheet, View, Text, TouchableWithoutFeedback } from "react-native";
import { Header } from "react-native-elements";
import { colors } from "../common/theme";
import i18n from "i18n-js";
import { useSelector } from "react-redux";
import { Icon } from "react-native-elements";

export default function RideListPage(props) {
  const bookings = useSelector((state) => state.bookinglistdata.bookings);
  const settings = useSelector((state) => state.settingsdata.settings);
  const [bookingData, setBookingData] = useState([]);
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const [tabIndex, setTabIndex] = useState(-1);
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    if (bookings) {
      setBookingData(bookings);
      if (props.navigation.getParam("fromBooking")) {
        const lastStatus = bookings[0].status;
        if (lastStatus == "COMPLETE") setTabIndex(1);
        if (lastStatus == "CANCELLED") setTabIndex(2);
      } else {
        setTabIndex(0);
      }
    } else {
      setBookingData([]);
      setTabIndex(0);
    }
  }, [bookings]);

  goDetails = (item, index) => {
    if (item && item.trip_cost > 0) {
      item.roundoffCost = Math.round(item.trip_cost).toFixed(settings.decimal);
      item.roundoff = (Math.round(item.roundoffCost) - item.trip_cost).toFixed(
        settings.decimal
      );
      props.navigation.push("RideDetails", { data: item });
    } else {
      item.roundoffCost = Math.round(item.estimate).toFixed(settings.decimal);
      item.roundoff = (Math.round(item.roundoffCost) - item.estimate).toFixed(
        settings.decimal
      );
      props.navigation.push("RideDetails", { data: item });
    }
  };

  const lCom = {
    icon: "ios-arrow-back",
    type: "ionicon",
    color: colors.BLACK,
    size: 35,
    component: TouchableWithoutFeedback,
    onPress: () =>
      auth &&
      auth.info &&
      auth.info.profile &&
      auth.info.profile.usertype == "rider"
        ? props.navigation.navigate("Map")
        : props.navigation.navigate("DriverTrips"),
  };

  return (
    <View style={styles.mainView}>
      <Header
        placement="left"
        backgroundColor={colors.WHITE}
        leftComponent={lCom}
        centerComponent={
          <View style={{ flexDirection: "row" }}>
            <Icon
              name="map"
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
      {tabIndex >= 0 ? (
        <RideList
          onPressButton={(item, index) => {
            goDetails(item, index);
          }}
          data={bookingData}
          tabIndex={tabIndex}
        ></RideList>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
  },
  containerView: { flex: 1 },
  textContainer: { textAlign: "center" },
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
});
