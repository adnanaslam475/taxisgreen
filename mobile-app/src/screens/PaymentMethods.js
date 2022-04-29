import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Header, Button, Icon } from "react-native-elements";
import { colors } from "../common/theme";
var { width } = Dimensions.get("window");
import i18n from "i18n-js";
import { useSelector } from "react-redux";
export default function PaymentMethods(props) {
  const goBack = () => {
    props.navigation.goBack();
  };
  const auth = useSelector((state) => state.auth);
  const [last4Digits, setLast4Digits] = React.useState([]);
  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const lCom = {
    icon: "ios-arrow-back",
    type: "ionicon",
    color: colors.PRIMARY,
    size: 30,
    component: TouchableWithoutFeedback,
    onPress: () => {
      goBack();
    },
  };
  const fetchPaymentMethod = async () => {
    const response = await fetch(
      `https://api.stripe.com/v1/payment_methods?customer=${auth.info.profile.stripeCustomerId}&type=card`,
      {
        headers: {
          Authorization:
            "Bearer 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",
        },
      }
    );

    const data = await response.json();
    setPaymentMethods(
      data.data.map((item) => {
        return item.id;
      })
    );
    setLast4Digits(
      data.data.map((item) => {
        return item.card.last4;
      })
    );
  };
  useEffect(() => {
    fetchPaymentMethod();
  }, []);

  const detachPaymentMethod = async (id) => {
    var myHeaders = new Headers();
    myHeaders.append(
      "Authorization",
      "Bearer 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"
    );

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      `https://api.stripe.com/v1/payment_methods/${id}/detach`,
      requestOptions
    )
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));

    fetchPaymentMethod();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header
        backgroundColor={colors.WHITE}
        leftComponent={isRTL ? null : lCom}
        centerComponent={
          <View style={styles.viewIcon}>
            <Icon
              name={"cc-visa"}
              type={"font-awesome"}
              color={colors.PRIMARY}
              size={28}
              containerStyle={styles.iconStyle}
            />
            <Text style={styles.headerTitleStyle}>{t("paymentMethod")}</Text>
          </View>
        }
        rightComponent={isRTL ? rCom : null}
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />
      <View style={styles.mainView}>
        {last4Digits.map((item, index) => {
          return (
            <View
              style={{
                flexDirection: "row",
                width: width * 0.9,
                backgroundColor: "#F8F8F8",
                padding: 15,
                margin: 10,
                borderRadius: 25,
              }}
            >
              <Icon
                name={`credit-card`}
                type={"FontAwesome"}
                // color={colors.PRIMARY}
                size={28}
                containerStyle={styles.iconStyle}
              />
              <Text
                style={[
                  styles.headerTitleStyle,
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                  },
                ]}
              >
                **** **** **** {item}
              </Text>
              <Icon
                name={`delete`}
                type={"AntDesign"}
                color={colors.RED}
                size={28}
                onPress={() => {
                  detachPaymentMethod(paymentMethods[index]);
                }}
                containerStyle={styles.iconStyle}
              />
            </View>
          );
        })}
        <Button
          onPress={() => {
            props.navigation.navigate("AddPaymentMethod");
          }}
          icon={{ name: "plus", type: "font-awesome", color: colors.WHITE }}
          title={"Ajouter un mode de paiement"}
          // loading={props.loading}
          titleStyle={styles.buttonTitle}
          buttonStyle={styles.registerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    color: colors.PRIMARY,
    fontFamily: "Roboto-Bold",
    fontSize: 20,
    marginLeft: 10,
  },
  mainView: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    textAlign: "center",
  },
  iconStyle: {
    justifyContent: "center",
    alignItems: "center",
  },
  viewIcon: {
    flexDirection: "row",
    // width: 24,
    height: 24,
    // borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: colors.MAP_TEXT,
    // left: 1,
  },
  registerButton: {
    backgroundColor: "#72C048",
    width: width - 40,
    height: 50,
    borderRadius: 25,
  },
  buttonTitle: {
    fontSize: 16,
  },
});
