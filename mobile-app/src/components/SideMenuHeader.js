import React from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  ImageBackground,
} from "react-native";
import { Icon } from "react-native-elements";
import { colors } from "../common/theme";
import i18n from "i18n-js";
//make a compontent
const isRTL =
  i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

const SideMenuHeader = ({ headerStyle, userPhoto, userName, userEmail }) => {
  return (
    <>
      <View style={[styles.viewStyle, headerStyle]}>
        <View style={styles.mainWrapper}>
          <Image
            style={{
              width: "100%",
              height: 90,
              transform: [{ rotate: "180deg" }],
            }}
            source={require("../../assets/images/menuDesign.png")}
          ></Image>
          <View style={{ marginBottom: 80 }}>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                paddingLeft: 20,
                marginBottom: 10,
              }}
            >
              <TouchableOpacity style={styles.userImageView}>
                <Image
                  source={
                    userPhoto == null
                      ? require("../../assets/images/profilePic.png")
                      : { uri: userPhoto }
                  }
                  style={styles.imageStyle}
                />
              </TouchableOpacity>
              <View style={styles.headerTextStyle}>
                <Text
                  style={[
                    styles.ProfileNameStyle,
                    {
                      marginLeft: 10,
                    },
                  ]}
                >
                  {userName ? userName.toUpperCase() : ""}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.iconViewStyle,
                { flexDirection: isRTL ? "row-reverse" : "row" },
              ]}
            >
              <Icon
                name="mail-read"
                type="octicon"
                color={colors.WHITE}
                size={16}
              />
              <Text
                style={[
                  styles.emailStyle,
                  isRTL ? { marginRight: 4 } : { marginLeft: 4 },
                ]}
              >
                {userEmail ? userEmail.toLowerCase() : ""}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = {
  viewStyle: {
    backgroundColor: colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    height: 100,
    paddingTop: 25,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    marginBottom: 35,
    elevation: 2,
    position: "relative",
    flexDirection: "column",
  },

  mainWrapper: {
    backgroundColor: colors.WHITE,
    width: "100%",
    // padding: 20,
    marginTop: 70,
    // borderRadius: 10,
  },
  textStyle: {
    fontSize: 20,
    color: colors.BLACK,
  },
  headerTextStyle: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  iconStyle: {},
  userImageView: {
    width: 56,
    height: 56,
    borderRadius: 30,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.WHITE,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  ProfileNameStyle: {
    fontWeight: "bold",
    color: colors.BLACK,
    fontSize: 15,
  },
  iconViewStyle: {
    width: 220,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  emailStyle: {
    color: colors.BLACK,
    fontSize: 13,
    marginLeft: 4,
    textAlign: "center",
  },
  imageStyle: {
    width: 80,
    height: 80,
  },
};
//make the component available to other parts of the app
export default SideMenuHeader;
