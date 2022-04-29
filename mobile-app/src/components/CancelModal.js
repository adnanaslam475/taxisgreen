import React, { useState, useContext } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Text,
  Platform,
  Modal,
} from "react-native";
import { Icon, Button, Header } from "react-native-elements";
import { colors } from "../common/theme";
import RadioForm from "react-native-simple-radio-button";

var { width, height } = Dimensions.get("window");
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from "common/src";

import i18n from "i18n-js";
const hasNotch =
  Platform.OS === "ios" &&
  !Platform.isPad &&
  !Platform.isTVOS &&
  (height === 780 ||
    width === 780 ||
    height === 812 ||
    width === 812 ||
    height === 844 ||
    width === 844 ||
    height === 896 ||
    width === 896 ||
    height === 926 ||
    width === 926);

export default function CancelModal(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const lCom = {
    icon: "ios-arrow-back",
    type: "ionicon",
    color: colors.BLACK,
    size: 35,
    component: TouchableWithoutFeedback,
    onPress: () => {
      setModalVisible(false);
    },
  };
  const role = useSelector((state) => state.auth.info.profile.usertype);

  const {
    fetchBookingLocations,
    stopLocationFetch,
    updateBookingImage,
    cancelBooking,
    updateBooking,
    getRouteDetails,
  } = api;
  const dispatch = useDispatch();
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const {
    modalVisible,
    setModalVisible,
    cancelReasons,
    setCancelReasonSelected,
    cancelReasonSelected,
    curBooking,
    setShouldVisible,
  } = props;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
      }}
    >
      <View style={styles.cancelModalContainer}>
        <View style={styles.cancelModalInnerContainer}>
          <View style={styles.cancelContainer}>
            <Header
              placement="right"
              backgroundColor={colors.TRANSPARENT}
              leftComponent={isRTL ? null : lCom}
              // rightComponent={isRTL ? rCom : null}
              containerStyle={styles.headerContainerStyle}
              innerContainerStyles={styles.headerInnerContainer}
            />
            <View style={{ flex: 1 }}></View>

            <View style={styles.cancelReasonContainer}>
              <Text style={styles.cancelReasonText}>Annuler un trajet</Text>
              <Text
                style={[
                  styles.cancelReasonText,
                  {
                    fontWeight: "normal",
                    fontSize: 14,
                    marginTop: 10,
                  },
                ]}
              >
                Que s’est-il passé ? Dis nous tout :
              </Text>
            </View>

            <View style={styles.radioContainer}>
              <RadioForm
                radio_props={cancelReasons}
                initial={0}
                animation={false}
                buttonColor={colors.RADIO_BUTTON}
                selectedButtonColor={colors.PRIMARY}
                buttonSize={10}
                buttonOuterSize={20}
                style={styles.radioContainerStyle}
                labelStyle={styles.radioText}
                radioStyle={[
                  styles.radioStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
                onPress={(value) => {
                  setCancelReasonSelected(value);
                }}
              />
              <Button
                title={"Confirmer l’annulation"}
                titleStyle={styles.buttonTitle}
                onPress={() => {
                  if (cancelReasonSelected >= 0) {
                    dispatch(
                      cancelBooking({
                        booking: curBooking,
                        reason: cancelReasons[cancelReasonSelected].label,
                        cancelledBy: role,
                      })
                    );
                    setShouldVisible(false);
                  } else {
                    Alert.alert(t("alert"), t("select_reason"));
                  }
                }}
                buttonStyle={styles.registerButton}
                // containerStyle={styles.cancelModalButtonContainerStyle}
              />
            </View>

            {/* <View
              style={[
                styles.cancelModalButtosContainer,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            > */}
            {/* <Button
                title={t("dont_cancel_text")}
                titleStyle={styles.signInTextStyle}
                onPress={() => {
                  setModalVisible(false);
                }}
                buttonStyle={styles.cancelModalButttonStyle}
                containerStyle={styles.cancelModalButtonContainerStyle}
              /> */}

            {/* <View style={styles.buttonSeparataor} /> */}

            {/* </View> */}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  //cancel modal
  cancelModalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.BACKGROUND,
  },
  cancelModalInnerContainer: {
    // height: 400,
    flex: 1,
    width: width,
    padding: 0,
    backgroundColor: colors.WHITE,
    // alignItems: "center",
    // alignSelf: "center",
    // borderRadius: 7,
  },
  cancelContainer: {
    flex: 1,
    // justifyContent: "space-between",
    // width: width * 0.85,
  },
  cancelReasonContainer: { flex: 1, marginLeft: 20 },
  cancelReasonText: {
    top: 10,
    color: colors.BLACK,
    fontFamily: "Roboto-Bold",
    fontSize: 28,
    // alignSelf: "center",
  },
  radioContainer: {
    flex: 8,
    margin: 20,
    // alignItems: "center"
  },
  radioText: { fontSize: 16, fontFamily: "Roboto-Bold", color: colors.BLACK },
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
  item: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    // padding: 10,
    // marginBottom: 10,
    flexDirection: "row",
  },

  //   headerContainerStyle: {
  //     backgroundColor: colors.TRANSPARENT,
  //     borderBottomWidth: 0,
  //     marginTop: 0,
  //   },
  //   headerInnerContainer: {
  //     marginLeft: 10,
  //     marginRight: 10,
  //   },
  registerButton: {
    backgroundColor: "#72C048",
    width: 230,
    height: 50,
    borderColor: colors.TRANSPARENT,
    borderWidth: 0,
    marginTop: 30,
    borderRadius: 24,
  },
  buttonTitle: {
    fontSize: 16,
  },

  container: {
    flex: 1,
    // backgroundColor: colors.WHITE,
    backgroundColor: colors.WHITE,
  },
  mainContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    top: hasNotch ? 40 : 20,
  },
  menuIconButton: {
    flex: 1,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    height: 50,
    width: 180,
    // backgroundColor: colors.WHITE,
    // shadowColor: colors.BLACK,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.5,
    // shadowRadius: 2,
    // elevation: 2,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: hasNotch ? 40 : 20,
  },
  topTitle1: {
    height: 50,
    width: 180,
    // backgroundColor: colors.WHITE,
    // shadowColor: colors.BLACK,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.5,
    // shadowRadius: 2,
    // elevation: 2,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    justifyContent: "center",
    position: "absolute",
    left: 0,
    top: hasNotch ? 40 : 20,
  },
  text2: {
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    fontWeight: "900",
    color: colors.BORDER_TEXT,
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
  cancelModalButtosContainer: {
    flex: 1,
    backgroundColor: colors.BUTTON,
    alignItems: "center",
    justifyContent: "center",
  },
  signInTextStyle: {
    fontFamily: "Roboto-Bold",
    fontWeight: "700",
    color: colors.WHITE,
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
});
