import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Image,
  TouchableWithoutFeedback,
  Platform,
  Alert,
  Linking,
} from "react-native";
import Background from "./Background";
import { Icon, Button, Header, Input } from "react-native-elements";
import CheckBox from "react-native-check-box";

import { colors } from "../common/theme";
var { height } = Dimensions.get("window");
import i18n from "i18n-js";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
import RNPickerSelect from "react-native-picker-select";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import ActionSheet from "react-native-actions-sheet";
import { FirebaseContext } from "common/src";

export default function Registration(props) {
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const [process_step, setProcessStep] = useState(0);

  const { api, appcat } = useContext(FirebaseContext);
  const { countries } = api;
  const [state, setState] = useState({
    usertype: "rider",
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    referralId: "",
    vehicleNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    carType: props.cars && props.cars.length > 0 ? props.cars[0].value : "",
    bankAccount: "",
    bankCode: "",
    bankName: "",
    taxiProCardImage: null,
    idImage: null,
    parkingCardImage: null,
    insuranceCertificateImage: null,
    certificateRcProImage: null,
    kbisOrInseeImage: null,
    registrationCertificateImage: null,
    leaseManagementContractImage: null,
    riBBankAccountImage: null,
    licenseImage: null,
    password: "",
    numberOfPlace: "",
    vehicleColor: "",
    options: [],
    companyName: "",
    companyAddress: "",
    companyLicenseNumber: "",
  });
  const [role, setRole] = useState(0);
  const [isSelected, setSelection] = useState(false);
  const [confirmpassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState();
  const [mobileWithoutCountry, setMobileWithoutCountry] = useState("");
  const settings = useSelector((state) => state.settingsdata.settings);
  const actionSheetRef = useRef(null);
  const [process_image, set_process_image] = useState("");
  const options = [
    "Aucun",
    "Siège BB",
    "Parle Anglais",
    "Colis non-accompagné",
    "Animal",
    "Conventionné",
  ];
  const radio_props = [
    { label: t("no"), value: 0 },
    { label: t("yes"), value: 1 },
  ];

  const formatCountries = () => {
    let arr = [];
    for (let i = 0; i < countries.length; i++) {
      let txt = countries[i].label + " (+" + countries[i].phone + ")";
      arr.push({ label: txt, value: txt, key: txt });
    }
    return arr;
  };

  useEffect(() => {
    if (settings) {
      for (let i = 0; i < countries.length; i++) {
        if (countries[i].label == settings.country) {
          setCountryCode(settings.country + " (+" + countries[i].phone + ")");
        }
      }
    }
  }, [settings]);

  const showActionSheet = () => {
    actionSheetRef.current?.setModalVisible(true);
  };

  const uploadImage = () => {
    return (
      <ActionSheet ref={actionSheetRef}>
        <TouchableOpacity
          style={{
            width: "90%",
            alignSelf: "center",
            paddingLeft: 20,
            paddingRight: 20,
            borderColor: colors.WALLET_PRIMARY,
            borderBottomWidth: 1,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            _pickImage("CAMERA", ImagePicker.launchCameraAsync);
          }}
        >
          <Text style={{ color: colors.CAMERA_TEXT, fontWeight: "bold" }}>
            {t("camera")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "90%",
            alignSelf: "center",
            paddingLeft: 20,
            paddingRight: 20,
            borderBottomWidth: 1,
            borderColor: colors.WALLET_PRIMARY,
            height: 60,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            _pickImage("MEDIA", ImagePicker.launchImageLibraryAsync);
          }}
        >
          <Text style={{ color: colors.CAMERA_TEXT, fontWeight: "bold" }}>
            {t("medialibrary")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: "90%",
            alignSelf: "center",
            paddingLeft: 20,
            paddingRight: 20,
            height: 50,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => {
            actionSheetRef.current?.setModalVisible(false);
          }}
        >
          <Text style={{ color: "red", fontWeight: "bold" }}>Cancel</Text>
        </TouchableOpacity>
      </ActionSheet>
    );
  };

  const _pickImage = async (permissionType, res) => {
    var pickFrom = res;
    let permisions;
    if (permissionType == "CAMERA") {
      permisions = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }
    const { status } = permisions;
    if (status == "granted") {
      let result = await pickFrom({
        // allowsEditing: true,
        // aspect: [4, 3],
        quality: 1.0,
        base64: true,
      });

      actionSheetRef.current?.setModalVisible(false);
      if (!result.cancelled) {
        let data = "data:image/jpeg;base64," + result.base64;

        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function () {
            Alert.alert(t("alert"), t("image_upload_error"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", Platform.OS == "ios" ? data : result.uri, true);
          xhr.send(null);
        });
        const newKey = process_image + "Image";
        if (blob) {
          setState({ ...state, [newKey]: blob });
        }
      }
    } else {
      Alert.alert(t("alert"), t("camera_permission_error"));
    }
  };

  //upload cancel
  // const cancelPhoto = () => {
  //   setCapturedImage(null);
  // };
  const radio_props_steps = [
    { label: "Catégorie de Véhicule", value: 0 },
    { label: "Marque du Véhicule", value: 1 },

    { label: "Modèle du Véhicule", value: 2 },
    { label: "Immatriculation du Véhicule", value: 3 },

    { label: "Nombre de Place", value: 4 },
    { label: "Couleur du Véhicule ", value: 5 },

    { label: "Options", value: 6 },
    { label: "Société/Artisan", value: 7 },
    { label: "Documents", value: 8 },
  ];
  const setUserType = (value) => {
    if (value == 0) {
      setState({ ...state, usertype: "rider" });
    } else {
      setState({ ...state, usertype: "driver" });
    }
  };

  const validateMobile = () => {
    let mobileValid = true;
    if (mobileWithoutCountry.length < 6) {
      mobileValid = false;
      Alert.alert(t("alert"), t("mobile_no_blank_error"));
    }
    return mobileValid;
  };

  const validatePassword = (complexity) => {
    let passwordValid = true;
    const regx1 = /^([a-zA-Z0-9@*#?.%$!^_+:;/,'"-=~|/`<>{}()]{6,30})$/;
    const regx2 =
      /(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&amp;*()_+}{&quot;:;'?/&gt;.&lt;,])(?!.*\s).*$/;
    if (complexity == "any") {
      passwordValid = state.password.length >= 1;
      if (!passwordValid) {
        Alert.alert(t("alert"), t("password_blank_messege"));
      }
    } else if (complexity == "alphanumeric") {
      passwordValid = regx1.test(state.password);
      if (!passwordValid) {
        Alert.alert(t("alert"), t("password_alphaNumeric_check"));
      }
    } else if (complexity == "complex") {
      passwordValid = regx2.test(password);
      if (!passwordValid) {
        Alert.alert(t("alert"), t("password_complexity_check"));
      }
    }
    if (state.password != confirmpassword) {
      passwordValid = false;
      if (!passwordValid) {
        Alert.alert(t("alert"), t("confrim_password_not_match_err"));
      }
    }
    return passwordValid;
  };
  const render_step = (i) => {
    if (i === 0 && process_step === 0) {
      return (
        <View
          style={[
            styles.textInputContainerStyle,
            {
              marginBottom: 10,
              flexDirection: isRTL ? "row-reverse" : "row",
            },
          ]}
        >
          <View
            style={[
              {
                flexDirection: isRTL ? "column-reverse" : "column",
              },
              isRTL ? { marginRight: 20 } : { marginLeft: 20 },
            ]}
          >
            {props.cars ? (
              <RadioForm
                radio_props={props.cars}
                initial={0}
                animation={false}
                buttonColor={colors.RADIO_BUTTON}
                selectedButtonColor={colors.PRIMARY}
                buttonSize={10}
                buttonOuterSize={20}
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  marginLeft: 20,
                }}
                labelStyle={[
                  styles.radioText,
                  {
                    fontFamily: "Roboto-Regular",
                  },
                ]}
                radioStyle={[
                  // styles.radioStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" },
                ]}
                onPress={(value) => {
                  setState({ ...state, carType: value });
                }}
              />
            ) : null}
          </View>
        </View>
      );
    } else if (i === 1 && process_step === 1) {
      return (
        <View
          style={
            (styles.textInputContainerStyle,
            { flexDirection: isRTL ? "column-reverse" : "column" })
          }
        >
          <Input
            editable={true}
            returnKeyType={"next"}
            // underlineColorAndroid={colors.TRANSPARENT}
            placeholder={"Renault"}
            placeholderTextColor={colors.BLACK}
            value={state.vehicleMake}
            inputStyle={[
              styles.inputTextStyle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
            onChangeText={(text) => {
              setState({ ...state, vehicleMake: text });
            }}
            inputContainerStyle={[
              styles.inputContainerDriver,
              {
                width: "50%",
              },
            ]}
            containerStyle={styles.textInputStyle}
          />
        </View>
      );
    } else if (i === 2 && process_step === 2) {
      return (
        <View
          style={
            (styles.textInputContainerStyle,
            { flexDirection: isRTL ? "column-reverse" : "column" })
          }
        >
          <Input
            editable={true}
            // underlineColorAndroid={colors.TRANSPARENT}
            placeholder={"8877090"}
            placeholderTextColor={colors.BLACK}
            value={state.vehicleModel}
            inputStyle={[
              styles.inputTextStyle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
            onChangeText={(text) => {
              setState({ ...state, vehicleModel: text });
            }}
            inputContainerStyle={[
              styles.inputContainerDriver,
              {
                width: "50%",
              },
            ]}
            containerStyle={styles.textInputStyle}
          />
        </View>
      );
    } else if (i === 3 && process_step === 3) {
      return (
        <View
          style={
            (styles.textInputContainerStyle,
            { flexDirection: isRTL ? "column-reverse" : "column" })
          }
        >
          <Input
            editable={true}
            // underlineColorAndroid={colors.TRANSPARENT}
            placeholder={"87HDBD"}
            placeholderTextColor={colors.BLACK}
            value={state.vehicleNumber}
            inputStyle={[
              styles.inputTextStyle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
            onChangeText={(text) => {
              setState({ ...state, vehicleNumber: text });
            }}
            inputContainerStyle={[
              styles.inputContainerDriver,
              {
                width: "50%",
              },
            ]}
            containerStyle={styles.textInputStyle}
          />
        </View>
      );
    } else if (i === 4 && process_step === 4) {
      return (
        <View
          style={
            (styles.textInputContainerStyle,
            { flexDirection: isRTL ? "column-reverse" : "column" })
          }
        >
          <Input
            editable={true}
            // underlineColorAndroid={colors.TRANSPARENT}
            placeholder={"4"}
            placeholderTextColor={colors.BLACK}
            value={state.numberOfPlace}
            inputStyle={[
              styles.inputTextStyle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
            onChangeText={(text) => {
              setState({ ...state, numberOfPlace: text });
            }}
            inputContainerStyle={[
              styles.inputContainerDriver,
              {
                width: "50%",
              },
            ]}
            containerStyle={styles.textInputStyle}
          />
        </View>
      );
    } else if (i === 5 && process_step === 5) {
      return (
        <View
          style={
            (styles.textInputContainerStyle,
            { flexDirection: isRTL ? "column-reverse" : "column" })
          }
        >
          <Input
            editable={true}
            // underlineColorAndroid={colors.TRANSPARENT}
            placeholder={"Green"}
            placeholderTextColor={colors.BLACK}
            value={state.vehicleColor}
            inputStyle={[
              styles.inputTextStyle,
              { textAlign: isRTL ? "right" : "left" },
            ]}
            onChangeText={(text) => {
              setState({ ...state, vehicleColor: text });
            }}
            inputContainerStyle={[
              styles.inputContainerDriver,
              {
                width: "50%",
              },
            ]}
            containerStyle={styles.textInputStyle}
          />
        </View>
      );
    } else if (i === 6 && process_step === 6) {
      return (
        <View
          style={
            (styles.textInputContainerStyle,
            { flexDirection: isRTL ? "column-reverse" : "column" })
          }
        >
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
              // paddingHorizontal: 20,
            }}
          >
            <View
              style={{
                flexDirection: isRTL ? "column-reverse" : "column",
                // justifyContent: "space-between",
                // alignItems: "center",
                // width: "100%",
                // paddingHorizontal: 20,
              }}
            >
              {options.slice(0, 3).map((item, index) => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                  key={index}
                >
                  <CheckBox
                    disabled={false}
                    isChecked={state.options.includes(item)}
                    // color={"#28c40b"}
                    // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
                    onClick={() => {
                      if (!state.options.includes(item)) {
                        setState({
                          ...state,
                          options: [...state.options, item],
                        });
                      } else {
                        setState({
                          ...state,
                          options: state.options.filter((item1) => {
                            return item1 !== item;
                          }),
                        });
                      }
                    }}
                  />
                  <Text
                    style={{
                      color: "#000",
                      fontWeight: "bold",
                      maxWidth: 100,
                    }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
            <View
              style={{
                flexDirection: isRTL ? "column-reverse" : "column",
                // justifyContent: "space-between",
                // alignItems: "center",
                // width: "100%",
                // paddingHorizontal: 20,
              }}
            >
              {options.slice(3, 7).map((item, index) => (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                  key={index}
                >
                  <CheckBox
                    isChecked={state.options.includes(item)}
                    // color={"#28c40b"}
                    disabled={false}
                    // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
                    onClick={() => {
                      if (!state.options.includes(item)) {
                        setState({
                          ...state,
                          options: [...state.options, item],
                        });
                      } else {
                        setState({
                          ...state,
                          options: state.options.filter((item1) => {
                            return item1 !== item;
                          }),
                        });
                      }
                    }}
                  />
                  <Text
                    style={{
                      color: "#000",
                      fontWeight: "bold",
                      maxWidth: 100,
                    }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    } else if (i === 7 && process_step === 7) {
      return (
        <View
          style={
            (styles.textInputContainerStyle,
            { flexDirection: isRTL ? "column-reverse" : "column" })
          }
        >
          <View
            style={{
              flexDirection: isRTL ? "column-reverse" : "column",
              marginLeft: isRTL ? 0 : 20,
            }}
          >
            <Text
              style={[
                {
                  // fontWeight: "bold",
                  color: colors.BLACK,
                  fontSize: 14,
                  marginTop: 20,
                },

                isRTL ? { marginRight: 20 } : { marginLeft: 20 },
              ]}
            >
              Nom
            </Text>
            <Input
              editable={true}
              // underlineColorAndroid={colors.TRANSPARENT}
              placeholder={"Azerty"}
              placeholderTextColor={colors.BLACK}
              value={state.companyName}
              inputStyle={[
                styles.inputTextStyle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
              onChangeText={(text) => {
                setState({ ...state, companyName: text });
              }}
              inputContainerStyle={[styles.inputContainerDriver]}
              containerStyle={[
                styles.textInputStyle,
                {
                  marginBottom: -15,
                },
              ]}
            />
          </View>
          <View
            style={{
              flexDirection: isRTL ? "column-reverse" : "column",
              marginLeft: isRTL ? 0 : 20,
              marginBottom: -15,
            }}
          >
            <Text
              style={[
                {
                  // fontWeight: "bold",
                  color: colors.BLACK,
                  fontSize: 14,
                  // marginTop: 5,
                  marginBottom: -5,
                },

                isRTL ? { marginRight: 20 } : { marginLeft: 20 },
              ]}
            >
              Adresse
            </Text>
            <Input
              editable={true}
              // underlineColorAndroid={colors.TRANSPARENT}
              placeholder={"95, Rue Paris"}
              placeholderTextColor={colors.BLACK}
              value={state.companyAddress}
              inputStyle={[
                styles.inputTextStyle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
              onChangeText={(text) => {
                setState({ ...state, companyAddress: text });
              }}
              inputContainerStyle={[styles.inputContainerDriver]}
              containerStyle={styles.textInputStyle}
            />
          </View>
          <View
            style={{
              flexDirection: isRTL ? "column-reverse" : "column",
              marginLeft: isRTL ? 0 : 20,
            }}
          >
            <Text
              style={[
                {
                  // fontWeight: "bold",
                  color: colors.BLACK,
                  fontSize: 14,
                  // marginTop: 5,
                  marginBottom: -5,
                },

                isRTL ? { marginRight: 20 } : { marginLeft: 20 },
              ]}
            >
              Numéro de licence
            </Text>
            <Input
              editable={true}
              // underlineColorAndroid={colors.TRANSPARENT}
              placeholder={"676960554"}
              placeholderTextColor={colors.BLACK}
              value={state.companyLicenseNumber}
              inputStyle={[
                styles.inputTextStyle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
              onChangeText={(text) => {
                setState({ ...state, companyLicenseNumber: text });
              }}
              inputContainerStyle={[styles.inputContainerDriver]}
              containerStyle={styles.textInputStyle}
            />
          </View>
        </View>
      );
    } else if (i === 8 && process_step === 8) {
      return (
        <View
          style={
            (styles.textInputContainerStyle,
            { flexDirection: isRTL ? "column-reverse" : "column" })
          }
        >
          <Text
            style={[
              {
                fontWeight: "bold",
                color: colors.BLACK,
                fontSize: 16,
              },

              isRTL ? { marginRight: 20 } : { marginLeft: 20 },
            ]}
          >
            Documents
          </Text>
          <View
            style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignContent: "center",
              marginLeft: isRTL ? 0 : 20,
            }}
          >
            <View
              style={{
                flexDirection: isRTL ? "column-reverse" : "column",
                // marginLeft: isRTL ? 0 : 20,
                justifyContent: "flex-start",
                alignContent: "center",
              }}
            >
              <Icon
                name="file"
                type={"material-community"}
                color={colors.BLACK}
                size={25}
                containerStyle={[
                  styles.iconContainer,
                  {
                    alignSelf: "flex-start",
                    marginTop: 10,
                  },
                ]}
              />
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                  },
                ]}
              >
                Carte pro Taxi
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                Permis de conduire
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                Pièce d’identité
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                Carte de stationnement
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                Attestation d’assurance
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                Attestation RC Pro
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                Kbis ou INSEE
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                Certificat d’immatriculation
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                Contrat location gérance
              </Text>
              <Text
                style={[
                  {
                    color: colors.BLACK,
                    fontSize: 16,
                    marginTop: 10,
                  },
                ]}
              >
                RIB Compte bancaire
              </Text>
            </View>

            <View
              style={{
                flexDirection: isRTL ? "column-reverse" : "column",
                marginLeft: isRTL ? 0 : 20,
              }}
            >
              <Text
                style={[
                  {
                    // fontWeight: "bold",
                    color: colors.BLACK,
                    fontSize: 16,
                    marginBottom: 30,
                  },

                  isRTL ? { marginRight: 20 } : { marginLeft: 20 },
                ]}
              >
                Ajouter
              </Text>
              <Icon
                name="upload"
                type="font-awesome"
                color={
                  state.taxiProCardImage == null ? colors.RED : colors.PRIMARY
                }
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("taxiProCard");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={state.licenseImage == null ? colors.RED : colors.PRIMARY}
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("license");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={state.idImage == null ? colors.RED : colors.PRIMARY}
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("id");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={
                  state.parkingCardImage == null ? colors.RED : colors.PRIMARY
                }
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("parkingCard");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={
                  state.insuranceCertificateImage == null
                    ? colors.RED
                    : colors.PRIMARY
                }
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("insuranceCertificate");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={
                  state.certificateRcProImage == null
                    ? colors.RED
                    : colors.PRIMARY
                }
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("certificateRcPro");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={
                  state.kbisOrInseeImage == null ? colors.RED : colors.PRIMARY
                }
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("kbisOrInsee");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={
                  state.registrationCertificateImage == null
                    ? colors.RED
                    : colors.PRIMARY
                }
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("registrationCertificate");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={
                  state.leaseManagementContractImage == null
                    ? colors.RED
                    : colors.PRIMARY
                }
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("leaseManagementContract");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={
                  state.riBBankAccountImage == null
                    ? colors.RED
                    : colors.PRIMARY
                }
                size={24}
                onPress={() => {
                  /* upload documents */
                  set_process_image("riBBankAccount");

                  showActionSheet();
                }}
                containerStyle={[
                  styles.iconContainer,
                  {
                    paddingBottom: 7,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      );
    }
  };
  //register button press for validation
  const onPressRegister = () => {
    const { onPressRegister } = props;

    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(state.email)) {
      if (state.usertype == "driver" && state.licenseImage == null) {
        Alert.alert(t("alert"), t("proper_input_licenseimage"));
      } else {
        if (
          (state.usertype == "driver" && state.vehicleNumber.length > 1) ||
          state.usertype == "rider"
        ) {
          if (
            /\S/.test(state.firstName) &&
            state.firstName.length > 0 &&
            /\S/.test(state.lastName) &&
            state.lastName.length > 0
          ) {
            if (validatePassword("alphanumeric")) {
              if (validateMobile()) {
                const userData = { ...state };
                if (userData.usertype == "rider") delete userData.carType;
                onPressRegister(userData);
              } else {
                Alert.alert(t("alert"), t("mobile_no_blank_error"));
              }
            }
          } else {
            Alert.alert(t("alert"), t("proper_input_name"));
          }
        } else {
          Alert.alert(t("alert"), t("proper_input_vehicleno"));
        }
      }
    } else {
      Alert.alert(t("alert"), t("proper_email"));
    }
  };

  const upDateCountry = (text) => {
    setCountryCode(text);
    let extNum = text.split("(")[1].split(")")[0];
    let formattedNum = mobileWithoutCountry.replace(/ /g, "");
    formattedNum = extNum + formattedNum.replace(/-/g, "");
    setState({ ...state, mobile: formattedNum });
  };

  const lCom = {
    icon: "ios-arrow-back",
    type: "ionicon",
    color: colors.BLACK,
    size: 35,
    component: TouchableWithoutFeedback,
    onPress: props.onPressBack,
  };
  const rCom = {
    icon: "ios-arrow-forward",
    type: "ionicon",
    color: colors.BLACK,
    size: 35,
    component: TouchableWithoutFeedback,
    onPress: props.onPressBack,
  };

  return (
    <Background>
      <Header
        placement="right"
        backgroundColor={colors.TRANSPARENT}
        leftComponent={isRTL ? null : lCom}
        rightComponent={isRTL ? rCom : null}
        containerStyle={styles.headerContainerStyle}
        innerContainerStyles={styles.headerInnerContainer}
      />
      <KeyboardAvoidingView
        style={styles.form}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {uploadImage()}
          {/* <View style={styles.logo}>
            <Image
              source={require("../../assets/images/logo165x90white.png")}
            />
          </View> */}
          <View style={styles.form}>
            <View
              style={[
                styles.containerStyle,
                isRTL
                  ? { marginRight: 10, marginLeft: 20 }
                  : { marginLeft: 10, marginRight: 20 },
                {
                  borderWidth: 0.8,
                  borderColor: colors.PRIMARY,
                  borderRadius: 33,
                },
              ]}
            >
              <View style={styles.seperator}>
                <View style={styles.lineLeft}></View>
                <View style={styles.lineLeftFiller}>
                  <Text style={styles.sepText}>{t("registration_title")}</Text>
                </View>
                <View style={styles.lineRight}></View>
              </View>
              <View
                style={
                  (styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" })
                }
              >
                {/* <Icon
                  name="user"
                  type="font-awesome"
                  color={colors.WHITE}
                  size={24}
                  containerStyle={styles.iconContainer}
                /> */}
                <Input
                  editable={true}
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("first_name_placeholder")}
                  placeholderTextColor={colors.BLACK}
                  value={state.firstName}
                  keyboardType={"email-address"}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => {
                    setState({ ...state, firstName: text });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                />
              </View>

              <View
                style={
                  (styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" })
                }
              >
                {/* <Icon
                  name="user"
                  type="font-awesome"
                  color={colors.WHITE}
                  size={24}
                  containerStyle={styles.iconContainer}
                /> */}
                <Input
                  editable={true}
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("last_name_placeholder")}
                  placeholderTextColor={colors.BLACK}
                  value={state.lastName}
                  keyboardType={"email-address"}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => {
                    setState({ ...state, lastName: text });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                />
              </View>
              <View
                style={
                  (styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" })
                }
              >
                {/* <Icon
                  name="envelope-o"
                  type="font-awesome"
                  color={colors.WHITE}
                  size={18}
                  containerStyle={styles.iconContainer}
                /> */}
                <Input
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("email_placeholder")}
                  placeholderTextColor={colors.BLACK}
                  value={state.email}
                  keyboardType={"email-address"}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => {
                    setState({ ...state, email: text });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                />
              </View>
              <View
                style={
                  (styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" })
                }
              >
                {/* <Icon
                  name="lock"
                  type="font-awesome"
                  color={colors.WHITE}
                  size={24}
                  containerStyle={styles.iconContainer}
                /> */}
                <Input
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("password_placeholder")}
                  placeholderTextColor={colors.BLACK}
                  value={state.password}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) =>
                    setState({ ...state, password: text })
                  }
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                  secureTextEntry={true}
                />
              </View>
              <View
                style={
                  (styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" })
                }
              >
                {/* <Icon
                  name="lock"
                  type="font-awesome"
                  color={colors.WHITE}
                  size={24}
                  containerStyle={styles.iconContainer}
                /> */}
                <Input
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("confrim_password_placeholder")}
                  placeholderTextColor={colors.BLACK}
                  value={confirmpassword}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => setConfirmPassword(text)}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                  secureTextEntry={true}
                />
              </View>
              <View
                style={[
                  styles.textInputContainerStyle,
                  {
                    marginBottom: 10,
                    flexDirection: isRTL ? "row-reverse" : "row",
                    marginTop: -25,
                  },
                ]}
              >
                {/* <Icon
                                name='mobile-phone'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={36}
                                containerStyle={[styles.iconContainer,{marginTop:15}, isRTL? {marginLeft: 10} : {marginLeft: 0}]}
                            /> */}

                <RNPickerSelect
                  key={countryCode}
                  placeholder={{
                    label: t("select_country"),
                    value: t("select_country"),
                  }}
                  value={countryCode}
                  useNativeAndroidPickerStyle={false}
                  style={{
                    inputIOS: [
                      styles.pickerStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ],
                    placeholder: {
                      color: "black",
                    },
                    inputAndroid: [
                      styles.pickerStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ],
                  }}
                  onValueChange={(text) => {
                    upDateCountry(text);
                  }}
                  items={formatCountries()}
                  disabled={settings.AllowCountrySelection ? false : true}
                  Icon={() => {
                    return (
                      <Ionicons
                        style={{ top: 15, marginRight: isRTL ? "80%" : 0 }}
                        name="md-arrow-down"
                        size={24}
                        color="gray"
                      />
                    );
                  }}
                />
              </View>
              <View
                style={
                  (styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" })
                }
              >
                {/* <Icon
                  name="mobile-phone"
                  type="font-awesome"
                  color={colors.WHITE}
                  size={36}
                  containerStyle={styles.iconContainer}
                /> */}
                <Input
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("mobile_no_placeholder")}
                  placeholderTextColor={colors.BLACK}
                  value={mobileWithoutCountry}
                  keyboardType={"number-pad"}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => {
                    setMobileWithoutCountry(text);
                    let formattedNum = text.replace(/ /g, "");
                    formattedNum =
                      countryCode.split("(")[1].split(")")[0] +
                      formattedNum.replace(/-/g, "");
                    setState({ ...state, mobile: formattedNum });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                />
              </View>
              <View
                style={
                  (styles.textInputContainerStyle,
                  { flexDirection: isRTL ? "row-reverse" : "row" })
                }
              >
                {/* <Icon
                  name="lock"
                  type="font-awesome"
                  color={colors.WHITE}
                  size={24}
                  containerStyle={styles.iconContainer}
                /> */}

                <Input
                  editable={true}
                  underlineColorAndroid={colors.TRANSPARENT}
                  placeholder={t("referral_id_placeholder")}
                  placeholderTextColor={colors.BLACK}
                  value={state.referralId}
                  inputStyle={[
                    styles.inputTextStyle,
                    { textAlign: isRTL ? "right" : "left" },
                  ]}
                  onChangeText={(text) => {
                    setState({ ...state, referralId: text });
                  }}
                  inputContainerStyle={styles.inputContainerStyle}
                  containerStyle={styles.textInputStyle}
                />
              </View>
              <View
                style={[
                  styles.textInputContainerStyle,
                  {
                    flexDirection: isRTL ? "row-reverse" : "row",
                    marginTop: -20,
                  },
                ]}
              >
                {/* <Icon
                  name="user"
                  type="font-awesome"
                  color={colors.WHITE}
                  size={24}
                  containerStyle={[
                    styles.iconContainer,
                    { paddingTop: 15 },
                    isRTL ? { marginLeft: 10 } : { marginLeft: 0 },
                  ]}
                /> */}
                <Text style={{ marginLeft: 20, color: colors.BLACK }}>
                  {t("register_as_driver")}
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <RadioForm
                  radio_props={radio_props}
                  initial={role}
                  formHorizontal={true}
                  labelHorizontal={true}
                  buttonColor={colors.GREEN_DOT}
                  labelColor={colors.GREEN_DOT}
                  style={isRTL ? { marginLeft: 20 } : { marginRight: 20 }}
                  labelStyle={isRTL ? { marginRight: 10 } : { marginRight: 10 }}
                  selectedButtonColor={colors.GREEN_DOT}
                  selectedLabelColor={colors.GREEN_DOT}
                  onPress={(value) => {
                    setRole(value);
                    setUserType(value);
                  }}
                />
              </View>
              {state.usertype === "driver" ? (
                <RadioForm
                  // formHorizontal={true}
                  animation={true}
                  initial={0}
                >
                  {/* To create radio buttons, loop through your array of options */}
                  {radio_props_steps.map((obj, i) => (
                    <View>
                      <RadioButton labelHorizontal={true} key={i}>
                        {/*  You can set RadioButtonLabel before RadioButtonInput */}

                        <RadioButtonInput
                          obj={obj}
                          index={i}
                          isSelected={process_step === i}
                          onPress={(value) => setProcessStep(value)}
                          borderWidth={1}
                          buttonInnerColor={colors.PRIMARY}
                          // buttonOuterColor={process_step === i ? "#2196f3" : "#000"}
                          buttonOuterColor={"#000"}
                          buttonSize={10}
                          buttonOuterSize={20}
                          buttonStyle={{}}
                          buttonWrapStyle={{ marginLeft: 10 }}
                        />
                        <RadioButtonLabel
                          obj={obj}
                          index={i}
                          labelHorizontal={true}
                          onPress={(value) => setProcessStep(value)}
                          // labelStyle={{ fontSize: 20, color: "#2ecc71" }}
                          labelStyle={{
                            fontSize: 16,
                            color: colors.BLACK,
                            fontWeight: "bold",
                          }}
                          labelWrapStyle={{}}
                        />
                      </RadioButton>
                      {state.usertype == "driver" ? render_step(i) : null}
                    </View>
                  ))}
                </RadioForm>
              ) : null}

              {state.usertype == "driver" && settings.bank_fields ? (
                <View
                  style={
                    (styles.textInputContainerStyle,
                    { flexDirection: isRTL ? "row-reverse" : "row" })
                  }
                >
                  {/* <Icon
                    name="numeric"
                    type={"material-community"}
                    color={colors.BLACK}
                    size={20}
                    containerStyle={styles.iconContainer}
                  /> */}
                  <Input
                    editable={true}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholder={t("bankCode")}
                    placeholderTextColor={colors.BLACK}
                    value={state.bankCode}
                    inputStyle={[
                      styles.inputTextStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                    onChangeText={(text) => {
                      setState({ ...state, bankCode: text });
                    }}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.textInputStyle}
                  />
                </View>
              ) : null}
              {state.usertype == "driver" && settings.bank_fields ? (
                <View
                  style={
                    (styles.textInputContainerStyle,
                    { flexDirection: isRTL ? "row-reverse" : "row" })
                  }
                >
                  {/* <Icon
                    name="numeric"
                    type={"material-community"}
                    color={colors.BLACK}
                    size={20}
                    containerStyle={styles.iconContainer}
                  /> */}
                  <Input
                    editable={true}
                    underlineColorAndroid={colors.TRANSPARENT}
                    placeholder={t("bankAccount")}
                    placeholderTextColor={colors.BLACK}
                    value={state.bankAccount}
                    inputStyle={[
                      styles.inputTextStyle,
                      { textAlign: isRTL ? "right" : "left" },
                    ]}
                    onChangeText={(text) => {
                      setState({ ...state, bankAccount: text });
                    }}
                    inputContainerStyle={styles.inputContainerStyle}
                    containerStyle={styles.textInputStyle}
                  />
                </View>
              ) : null}
              {/* {state.usertype == "driver" ? (
                capturedImage ? (
                  <View style={styles.imagePosition}>
                    <TouchableOpacity
                      style={styles.photoClick}
                      onPress={cancelPhoto}
                    >
                      <Image
                        source={require("../../assets/images/cross.png")}
                        resizeMode={"contain"}
                        style={styles.imageStyle}
                      />
                    </TouchableOpacity>
                    <Image
                      source={{ uri: capturedImage }}
                      style={styles.photoResult}
                      resizeMode={"cover"}
                    />
                  </View>
                ) : (
                  <View style={styles.capturePhoto}>
                    <View>
                      {state.imageValid ? (
                        <Text style={styles.capturePhotoTitle}>
                          {t("upload_driving_license")}
                        </Text>
                      ) : (
                        <Text style={styles.errorPhotoTitle}>
                          {t("upload_driving_license")}
                        </Text>
                      )}
                    </View>
                    <View
                      style={
                        (styles.capturePicClick,
                        { flexDirection: isRTL ? "row-reverse" : "row" })
                      }
                    >
                      <TouchableOpacity
                        style={styles.flexView1}
                        onPress={showActionSheet}
                      >
                        <View>
                          <View style={styles.imageFixStyle}>
                            <Image
                              source={require("../../assets/images/camera.png")}
                              resizeMode={"contain"}
                              style={styles.imageStyle2}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.myView}>
                        <View style={styles.myView1} />
                      </View>
                      <View style={styles.myView2}>
                        <View style={styles.myView3}>
                          <Text style={styles.textStyle}>
                            {t("image_size_warning")}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )
              ) : null} */}

              <View style={styles.checkboxContainer}>
                <CheckBox
                  disabled={false}
                  isChecked={isSelected}
                  style={{ marginTop: 10 }}
                  // color={"#28c40b"}
                  // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
                  onClick={() => {
                    setSelection(!isSelected);
                  }}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: colors.PRIMARY,
                    },
                  ]}
                  onPress={() =>
                    Linking.openURL(
                      "https://www.taxisgreen.com/conditions-de-vente/"
                    )
                  }
                >
                  {t("i_agree_with")}
                </Text>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  onPress={onPressRegister}
                  title={t("register_button")}
                  loading={props.loading}
                  titleStyle={styles.buttonTitle}
                  disabled={!isSelected}
                  buttonStyle={styles.registerButton}
                />
              </View>
              <View style={styles.gapView} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}

const styles = {
  headerContainerStyle: {
    backgroundColor: colors.TRANSPARENT,
    borderBottomWidth: 0,
    marginTop: 0,
  },
  headerInnerContainer: {
    marginLeft: 10,
    marginRight: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: colors.BLACK,
  },
  inputContainerDriver: {
    borderWidth: 1,
    borderColor: colors.PRIMARY,
    borderRadius: 5,
    marginTop: 10,
    paddingLeft: 10,
    paddingTop: 5,
  },
  textInputStyle: {
    marginLeft: 10,
  },
  iconContainer: {
    paddingBottom: 20,
    alignSelf: "center",
  },
  gapView: {
    height: 40,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    borderRadius: 40,
  },
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
  pickerStyle: {
    color: "black",
    width: 200,
    fontSize: 15,
    height: 40,
    marginLeft: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.BLACK,
  },
  inputTextStyle: {
    color: colors.BLACK,
    fontSize: 13,
    marginLeft: 0,
    height: 32,
  },
  errorMessageStyle: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 0,
  },
  containerStyle: {
    flexDirection: "column",
    marginTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
  },
  form: {
    flex: 1,
  },
  logo: {
    width: "100%",
    justifyContent: "flex-start",
    marginTop: 10,
    alignItems: "center",
  },
  scrollViewStyle: {
    height: height,
  },
  textInputContainerStyle: {
    alignItems: "center",
    paddingTop: 10,
  },
  headerStyle: {
    fontSize: 18,
    color: colors.BLACK,
    textAlign: "center",
    flexDirection: "row",
    marginTop: 0,
  },

  capturePhoto: {
    width: "80%",
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.BLACK,
    marginLeft: 20,
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 15,
  },
  capturePhotoTitle: {
    color: colors.BLACK,
    fontSize: 14,
    textAlign: "center",
    paddingBottom: 15,
  },
  errorPhotoTitle: {
    color: colors.RED,
    fontSize: 13,
    textAlign: "center",
    paddingBottom: 15,
  },
  photoResult: {
    alignSelf: "center",
    flexDirection: "column",
    justifyContent: "center",
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 10,
    marginTop: 15,
    width: "80%",
    height: height / 4,
  },
  imagePosition: {
    position: "relative",
  },
  photoClick: {
    paddingRight: 48,
    position: "absolute",
    zIndex: 1,
    marginTop: 18,
    alignSelf: "flex-end",
  },
  capturePicClick: {
    backgroundColor: colors.BLACK,
    flexDirection: "row",
    position: "relative",
    zIndex: 1,
  },
  imageStyle: {
    width: 30,
    height: height / 15,
  },
  flexView1: {
    flex: 12,
  },
  imageFixStyle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageStyle2: {
    width: 150,
    height: height / 15,
  },
  myView: {
    flex: 2,
    height: 50,
    width: 1,
    alignItems: "center",
  },
  myView1: {
    height: height / 18,
    width: 1.5,
    backgroundColor: colors.BORDER_TEXT,
    alignItems: "center",
    marginTop: 10,
  },
  myView2: {
    flex: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  myView3: {
    flex: 2.2,
    alignItems: "center",
    justifyContent: "center",
  },
  textStyle: {
    color: colors.WHITE,
    fontFamily: "Roboto-Bold",
    fontSize: 13,
  },
  seperator: {
    width: 250,
    height: 20,
    flexDirection: "row",
    marginTop: 20,
    alignSelf: "center",
  },
  lineLeft: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(113,113,113,1)",
    marginTop: 9,
  },
  sepText: {
    color: colors.PRIMARY,
    fontSize: 16,
    fontFamily: "Roboto-Regular",
  },
  lineLeftFiller: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  lineRight: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(113,113,113,1)",
    marginTop: 9,
  },
  checkboxContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  checkbox: {
    alignSelf: "center",
  },
  label: {
    margin: 8,
  },
  radioText: { fontSize: 16, fontFamily: "Roboto-Bold", color: colors.BLACK },
};
