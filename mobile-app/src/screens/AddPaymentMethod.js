import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { CreditCardInput } from "react-native-credit-card-input";
import { useSelector } from "react-redux";
import { colors } from "../common/theme";
import { Header } from "react-native-elements";

const AddPaymentMethod = ({ navigation }) => {
  const [CardInput, setCardInput] = React.useState({});
  const auth = useSelector((state) => state.auth);

  const onSubmit = async () => {
    if (CardInput.valid == false || typeof CardInput.valid == "undefined") {
      alert("Invalid Credit Card");
      return false;
    }

    const card = {
      "card[number]": CardInput.values.number.replace(/ /g, ""),
      "card[exp_month]": CardInput.values.expiry.split("/")[0],
      "card[exp_year]": CardInput.values.expiry.split("/")[1],
      "card[cvc]": CardInput.values.cvc,
    };
    card["type"] = "card";

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    headers["Authorization"] =
      "Bearer" +
      " " +
      "pk_live_51HuJidDhFyCskJknfoDa0JgQ201YlnC6LWzo8JQYQhV2991rLZr9vioJKSioczVbgE4qO2vzMycex8duqt1OFMve00Sfi4ry8d";

    const response = await fetch("https://api.stripe.com/v1/payment_methods", {
      body: Object.keys(card)
        .map((key) => key + "=" + card[key])
        .join("&"),
      headers: {
        ...headers,
      },
      method: "POST",
    });

    const data = await response.json();
    const headers2 = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    headers2["Authorization"] =
      "Bearer" +
      " " +
      "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";
    const res = await fetch(
      `https://api.stripe.com/v1/payment_methods/${data.id}/attach`,

      {
        body: `customer=${auth.info.profile.stripeCustomerId}`,
        headers: {
          ...headers2,
        },
        method: "POST",
      }
    );

    const data2 = await res.json();
    // Payment Method Attached
    if (data2.id) {
      alert(t("payment_method_added"));
      navigation.navigate("PaymentMethods");
    }
  };

  const _onChange = (data) => {
    setCardInput(data);
  };

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

  const goBack = () => {
    navigation.goBack();
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.WHITE,
      }}
    >
      <Header
        backgroundColor={colors.WHITE}
        leftComponent={lCom}
        centerComponent={
          <Text style={styles.headerTitleStyle}>Ajouter une carte</Text>
        }
        // rightComponent={isRTL ? rCom : null}
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />
      <View style={styles.container}>
        <View style={{ marginBottom: 15 }}>
          <CreditCardInput
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            labelStyle={styles.labelStyle}
            validColor="#fff"
            placeholderColor="#ccc"
            onChange={_onChange}
          />

          <TouchableOpacity onPress={onSubmit} style={styles.button}>
            <Text style={styles.buttonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  ImgStyle: {
    width: "100%",
    height: 200,
    resizeMode: "contain",
    borderRadius: 8,
  },
  button: {
    backgroundColor: colors.PRIMARY,
    width: 150,
    height: 45,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 15,
    color: "#f4f4f4",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  inputContainerStyle: {
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  inputStyle: {
    backgroundColor: "#222242",
    paddingLeft: 15,
    borderRadius: 5,
    color: "#fff",
  },
  labelStyle: {
    marginBottom: 5,
    fontSize: 12,
  },
  headerStyle: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 0,
  },
  headerTitleStyle: {
    color: colors.PRIMARY,
    fontFamily: "Roboto-Bold",
    fontSize: 24,
    marginLeft: 10,
  },
});

//make this component available to the app
export default AddPaymentMethod;
