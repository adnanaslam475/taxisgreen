import React, { useState, useEffect } from "react";
import { Header, Icon } from "react-native-elements";
import { colors } from "../common/theme";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import i18n from "i18n-js";
import { useSelector } from "react-redux";
import getWeek from "./GetWeek";
import { LineChart } from "react-native-chart-kit";

export default function DriverIncomeScreen(props) {
  const bookings = useSelector((state) => state.bookinglistdata.bookings);
  const settings = useSelector((state) => state.settingsdata.settings);
  const [totalEarning, setTotalEarning] = useState(0);
  const [today, setToday] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const [bookingCount, setBookingCount] = useState();
  const [datasets, setDatasets] = useState([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (bookings) {
      let today = new Date();
      let tdTrans = 0;
      let mnTrans = 0;
      let totTrans = 0;
      let count = 0;
      for (let i = 0; i < bookings.length; i++) {
        if (
          bookings[i].status === "PAID" ||
          bookings[i].status === "COMPLETE"
        ) {
          const { tripdate, driver_share } = bookings[i];
          let tDate = new Date(tripdate);
          if (driver_share != undefined) {
            if (
              tDate.getDate() === today.getDate() &&
              tDate.getMonth() === today.getMonth()
            ) {
              tdTrans = tdTrans + parseFloat(driver_share);
            }
            if (
              tDate.getMonth() === today.getMonth() &&
              tDate.getFullYear() === today.getFullYear()
            ) {
              mnTrans = mnTrans + parseFloat(driver_share);
            }

            if (
              getWeek(tDate) === getWeek(today) &&
              tDate.getMonth() === today.getMonth()
            ) {
              const newDatasets = datasets;
              newDatasets[tDate.getDay()] =
                newDatasets[tDate.getDay()] + parseFloat(driver_share);

              setDatasets(newDatasets);
              //   mnTrans = mnTrans + parseFloat(driver_share);
            }

            totTrans = totTrans + parseFloat(driver_share);
            count = count + 1;
          }
        }
      }
      setTotalEarning(totTrans.toFixed(settings.decimal));
      setToday(tdTrans.toFixed(settings.decimal));
      setThisMonth(mnTrans.toFixed(settings.decimal));
      setBookingCount(count);
    } else {
      setTotalEarning(0);
      setToday(0);
      setThisMonth(0);
    }
  }, [bookings]);

  const line = {
    labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    datasets: [
      {
        data: datasets,
        strokeWidth: 2, // optional
      },
    ],
  };

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.WHITE}
        // leftComponent={isRTL ? null : lCom}
        // rightComponent={isRTL ? lCom : null}
        centerComponent={
          <View style={styles.headerCenterComponentStyle}>
            <Icon
              name={"money-bill-wave"}
              type={"font-awesome-5"}
              color={colors.PRIMARY}
              size={28}
              containerStyle={{
                paddingHorizontal: 10,
              }}
            />
            <Text style={styles.headerTitleStyle}>{t("incomeText")}</Text>
          </View>
        }
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />
      <Text style={styles.todayEarningHeaderText}>{t("today_text")}</Text>

      <View style={styles.bodyContainer}>
        <View style={styles.todaysIncomeContainer}>
          {settings.swipe_symbol === false ? (
            <Text style={styles.todayEarningMoneyText}>
              {settings.symbol}
              {today ? parseFloat(today).toFixed(settings.decimal) : "0"}
            </Text>
          ) : (
            <Text style={styles.todayEarningMoneyText}>
              {today ? parseFloat(today).toFixed(settings.decimal) : "0"}
              {settings.symbol}
            </Text>
          )}
        </View>

        <View style={styles.listContainer}>
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              paddingBottom: 6,
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingHorizontal: 6,
            }}
          >
            <View
              style={[
                styles.totalEarning,
                {
                  backgroundColor: "#72C146",
                },
              ]}
            >
              <Text style={styles.todayEarningHeaderText2}>
                {t("thismonth")}
              </Text>
              {settings.swipe_symbol === false ? (
                <Text style={styles.todayEarningMoneyText2}>
                  {settings.symbol}
                  {thisMonth
                    ? parseFloat(thisMonth).toFixed(settings.decimal)
                    : "0"}
                </Text>
              ) : (
                <Text style={styles.todayEarningMoneyText2}>
                  {thisMonth
                    ? parseFloat(thisMonth).toFixed(settings.decimal)
                    : "0"}
                  {settings.symbol}
                </Text>
              )}
            </View>
            <View style={styles.thismonthEarning}>
              <Text style={styles.todayEarningHeaderText2}>
                {t("totalearning")}
              </Text>
              {settings.swipe_symbol === false ? (
                <Text style={styles.todayEarningMoneyText2}>
                  {settings.symbol}
                  {totalEarning
                    ? parseFloat(totalEarning).toFixed(settings.decimal)
                    : "0"}
                </Text>
              ) : (
                <Text style={styles.todayEarningMoneyText2}>
                  {totalEarning
                    ? parseFloat(totalEarning).toFixed(settings.decimal)
                    : "0"}
                  {settings.symbol}
                </Text>
              )}
            </View>
          </View>

          <View
            style={[
              styles.thismonthEarning,
              {
                width: "95%",
                paddingVertical: 6,
                backgroundColor: colors.CAMERA_TEXT,
                flexDirection: isRTL ? "row-reverse" : "row",
                height: 50,
              },
            ]}
          >
            <Text style={styles.todayEarningHeaderText2}>
              {t("booking_count")}
            </Text>

            <Text style={styles.todayEarningMoneyText2}>{bookingCount}</Text>
          </View>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Text
          style={[
            styles.headerTitleStyle,
            {
              color: colors.PROFILE_PLACEHOLDER_CONTENT,
            },
          ]}
        >
          Détail de la Semaine
        </Text>
        <LineChart
          data={line}
          width={Dimensions.get("window").width} // from react-native
          height={220}
          yAxisLabel={"$"}
          chartConfig={{
            backgroundColor: "#ffffff	",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 2, // optional, defaults to 2dp
            color: (opacity = 1) => `rgb(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,

    justifyContent: "space-between",
  },
  headerStyle: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    color: colors.PRIMARY,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
  },
  bodyContainer: {
    // backgroundColor: "#44990D",
    flexDirection: "column",
    width: Dimensions.get("window").width * 0.95,
    alignSelf: "center",
  },
  todaysIncomeContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#44990D",
    height: 180,
    borderRadius: 30,
  },
  listContainer: {
    backgroundColor: colors.WHITE,
    marginTop: 1,
    paddingVertical: 6,
    paddingBottom: 6,
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  todayEarningHeaderText: {
    fontSize: 20,
    paddingBottom: 5,
    color: colors.PROFILE_PLACEHOLDER_TEXT,
    textAlign: "center",
  },
  todayEarningMoneyText: {
    fontSize: 100,
    fontWeight: "bold",
    color: colors.WHITE,
  },
  totalEarning: {
    height: 90,
    width: "49%",
    backgroundColor: colors.BALANCE_GREEN,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  thismonthEarning: {
    height: 90,
    width: "49%",
    backgroundColor: "#FFD428",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  todayEarningHeaderText2: {
    fontSize: 16,
    paddingBottom: 5,
    color: colors.WHITE,
  },
  todayEarningMoneyText2: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.WHITE,
  },
  chartContainer: {
    flexDirection: "column",
    paddingBottom: 6,
    paddingHorizontal: 6,
  },
  headerCenterComponentStyle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
