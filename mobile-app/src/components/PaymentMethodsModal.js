import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  Modal,
  Image,
} from "react-native";
import { Icon, Button } from "react-native-elements";
import { colors } from "../common/theme";
import { useSelector } from "react-redux";
var { width, height } = Dimensions.get("window");
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
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

export default function PaymentMethodsModal(props) {
  const handleSubmit = () => {
    // clsoing this modal
    setPaymentMethodsModalStatus(false);
  };
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const {
    PaymentMethodsModalStatus,
    setPaymentMethodModalId,
    setPaymentMethodsModalStatus,
    paymentMethodModalId,
    redirectToAddCard,
    onPressCancel,
  } = props;
  const auth = useSelector((state) => state.auth);
  const [payment_methods, set_payment_methods] = React.useState([]);
  useEffect(() => {
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

      set_payment_methods(
        data.data.map((item) => {
          return {
            last4: item.card.last4,
            id: item.id,
          };
        })
      );
    };
    fetchPaymentMethod();
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={PaymentMethodsModalStatus}
      //   onShow={runFitCoords}
    >
      <View style={styles.container}>
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
            Mode Paiement
          </Text>
          <RadioForm
            initial={0}
            formHorizontal={false}
            labelHorizontal={true}
            style={{ marginTop: 10 }}
            labelStyle={{ marginLeft: 0 }}
          >
            {payment_methods.map((obj, i) => (
              <RadioButton
                labelHorizontal={true}
                key={i}
                style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
              >
                <RadioButtonInput
                  buttonSize={10}
                  buttonOuterSize={20}
                  obj={obj}
                  index={i}
                  isSelected={obj.id === paymentMethodModalId}
                  onPress={() => {
                    setPaymentMethodModalId(obj.id);
                  }}
                  buttonStyle={{}}
                  buttonWrapStyle={{ marginTop: 22 }}
                  buttonColor={colors.PRIMARY}
                  labelColor={colors.BLACK}
                  selectedButtonColor={colors.PRIMARY}
                  selectedLabelColor={colors.BLACK}
                />

                <TouchableOpacity style={[styles.carContainer]} key={i}>
                  <View
                    style={[
                      styles.viewIcon,
                      {
                        marginRight: isRTL ? 0 : 10,
                      },
                    ]}
                  >
                    <Icon
                      name={`credit-card`}
                      type={"FontAwesome"}
                      // color={colors.PRIMARY}
                      size={36}
                      // containerStyle={styles.iconStyle}
                    />
                  </View>

                  <View
                    style={[
                      styles.viewIcon,
                      {
                        flexDirection: "column",
                        alignItems: "flex-start",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.text2,
                        {
                          fontSize: 16,
                          fontWeight: "bold",
                          color: colors.BLACK,
                        },
                      ]}
                    >
                      Carte Bancaire
                    </Text>
                    <Text
                      style={[
                        styles.text2,
                        {
                          fontSize: 18,
                        },
                      ]}
                    >
                      **** **** **** {obj.last4}
                    </Text>
                  </View>
                </TouchableOpacity>
              </RadioButton>
            ))}
            <RadioButton
              labelHorizontal={true}
              //   key={i}
              style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
            >
              <RadioButtonInput
                buttonSize={10}
                buttonOuterSize={20}
                obj={"COD"}
                // index={i}
                isSelected={"COD" === paymentMethodModalId}
                onPress={() => {
                  setPaymentMethodModalId("COD");
                }}
                buttonStyle={{}}
                buttonWrapStyle={{ marginTop: 22 }}
                buttonColor={colors.PRIMARY}
                labelColor={colors.BLACK}
                selectedButtonColor={colors.PRIMARY}
                selectedLabelColor={colors.BLACK}
              />

              <TouchableOpacity style={[styles.carContainer]}>
                <View
                  style={[
                    styles.viewIcon,
                    {
                      marginRight: isRTL ? 0 : 10,
                    },
                  ]}
                >
                  <Image
                    source={require("../../assets/images/512px-Money_font_awesome.png")}
                    style={{
                      width: 30,
                      height: 30,
                      marginLeft: 12,
                      //   tintColor: colors.PRIMARY,
                    }}
                  ></Image>
                </View>

                <View
                  style={[
                    styles.viewIcon,
                    {
                      flexDirection: "column",
                      alignItems: "flex-start",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.text2,
                      {
                        fontSize: 16,
                        fontWeight: "bold",
                        color: colors.BLACK,
                      },
                    ]}
                  >
                    Paiement à bord CB/Espèces
                  </Text>
                </View>
              </TouchableOpacity>
            </RadioButton>
          </RadioForm>
          {payment_methods && payment_methods.length == 0 && (
            <Button
              onPress={() => {
                handleSubmit();
                onPressCancel();
                redirectToAddCard();
              }}
              icon={{ name: "plus", type: "font-awesome", color: colors.WHITE }}
              title={"Ajouter un mode de paiement"}
              // loading={props.loading}
              titleStyle={styles.buttonTitle}
              buttonStyle={styles.registerButton}
            />
          )}

          <Button
            onPress={handleSubmit}
            title={"Valider"}
            // loading={props.loading}
            titleStyle={styles.buttonTitle}
            buttonStyle={styles.registerButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  carContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: width / 1.5,
    height: 60,
    marginBottom: 5,
    marginLeft: 15,
    marginRight: 15,
    marginVertical: 10,
    backgroundColor: colors.WHITE,
    // borderRadius: 6,
    // borderWidth: 1,
    // borderColor: colors.BORDER_BACKGROUND,
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
  text2: {
    fontFamily: "Roboto-Regular",
    fontSize: 14,
    fontWeight: "900",
    color: colors.BORDER_TEXT,
  },
});
