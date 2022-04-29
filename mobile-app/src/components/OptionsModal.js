import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Modal,
} from "react-native";
import { Icon, Button } from "react-native-elements";
import { colors } from "../common/theme";
import CheckBox from "react-native-check-box";

var { width, height } = Dimensions.get("window");

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

export default function optionsModal(props) {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const options = [
    "Aucune",
    "Siège bébé",
    "Parle anglais",
    "colis non accompagné",
    "Animal",
    "Conventionné",
  ];
  const handleSubmit = () => {
    const newOptions = [];
    if (selectedLang1) {
      newOptions.push(options[0]);
    }
    if (selectedLang2) {
      newOptions.push(options[1]);
    }
    if (selectedLang3) {
      newOptions.push(options[2]);
    }
    if (selectedLang4) {
      newOptions.push(options[3]);
    }
    if (selectedLang5) {
      newOptions.push(options[4]);
    }
    if (selectedLang6) {
      newOptions.push(options[5]);
    }
    if (newOptions.length === 0) {
      setError(true);
      setErrorMessage("Veuillez choisir au moins une option");
    } else {
      setOptionsModalData(newOptions);
      setOptionsModalStatus(false);
    }
  };
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const { optionsModalStatus, setOptionsModalData, setOptionsModalStatus } =
    props;
  const [selectedLang1, setSelectedLang1] = useState(false);
  const [selectedLang2, setSelectedLang2] = useState(false);
  const [selectedLang3, setSelectedLang3] = useState(false);
  const [selectedLang4, setSelectedLang4] = useState(false);
  const [selectedLang5, setSelectedLang5] = useState(false);
  const [selectedLang6, setSelectedLang6] = useState(false);
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={optionsModalStatus}
      //   onShow={runFitCoords}
    >
      <View style={styles.container}>
        <View style={[styles.menuIcon, isRTL ? { left: 20 } : { right: 20 }]}>
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
            isRTL ? styles.topTitle : styles.topTitle1,
            { width: 120, flexDirection: "row" },
          ]}
        >
          <Icon
            name="map-pin"
            type="font-awesome"
            color={"#28c40b"}
            size={24}
            style={{ marginLeft: 37, marginTop: 12 }}
          />
          <Text
            style={{
              marginHorizontal: 7,
              marginTop: 12,
              textAlign: "center",
              color: "#28c40b",
              fontFamily: "Roboto-Bold",
              fontSize: 22,
            }}
          >
            {t("book_your_ride_menu")}
          </Text>
        </View>
        <View style={styles.mainContainer}>
          <Text
            style={[
              styles.text2,
              {
                fontSize: 24,
                marginTop: 20,
                color: colors.PROFILE_PLACEHOLDER_CONTENT,
                fontWeight: "bold",
              },
            ]}
          >
            Options
          </Text>
          <View style={styles.item}>
            <CheckBox
              disabled={false}
              isChecked={selectedLang1}
              // color={"#28c40b"}
              // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
              onClick={() => setSelectedLang1(!selectedLang1)}
            />
            <Text
              style={{
                ...styles.checkBoxTxt,
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {options[0]}
            </Text>
          </View>
          <View style={styles.item}>
            <CheckBox
              disabled={false}
              isChecked={selectedLang2}
              // color={"#28c40b"}
              // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
              onClick={() => setSelectedLang2(!selectedLang2)}
            />
            <Text
              style={{
                ...styles.checkBoxTxt,
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {options[1]}
            </Text>
          </View>
          <View style={styles.item}>
            <CheckBox
              disabled={false}
              isChecked={selectedLang3}
              // color={"#28c40b"}
              // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
              onClick={() => setSelectedLang3(!selectedLang3)}
            />
            <Text
              style={{
                ...styles.checkBoxTxt,
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {options[2]}
            </Text>
          </View>
          <View style={styles.item}>
            <CheckBox
              disabled={false}
              isChecked={selectedLang4}
              // color={"#28c40b"}
              // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
              onClick={() => setSelectedLang4(!selectedLang4)}
            />
            <Text
              style={{
                ...styles.checkBoxTxt,
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {options[3]}
            </Text>
          </View>
          <View style={styles.item}>
            <CheckBox
              disabled={false}
              isChecked={selectedLang5}
              // color={"#28c40b"}
              // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
              onClick={() => setSelectedLang5(!selectedLang5)}
            />
            <Text
              style={{
                ...styles.checkBoxTxt,
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {options[4]}
            </Text>
          </View>
          <View style={styles.item}>
            <CheckBox
              disabled={false}
              isChecked={selectedLang6}
              // color={"#28c40b"}
              // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
              onClick={() => setSelectedLang6(!selectedLang6)}
            />
            <Text
              style={{
                ...styles.checkBoxTxt,
                color: "#000",
                fontWeight: "bold",
              }}
            >
              {options[5]}
            </Text>
          </View>
          <Button
            onPress={handleSubmit}
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  item: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    // padding: 10,
    // marginBottom: 10,
    flexDirection: "row",
  },
  checkBoxTxt: {
    // marginLeft: 20,
    marginTop: 5,
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
});
