import React, { useEffect, useContext, useState, useRef } from "react";
import { colors } from "../common/theme";
import { useSelector, useDispatch } from "react-redux";
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
  StyleSheet,
  Linking,
} from "react-native";
import CheckBox from "react-native-check-box";

import { Icon, Button, Header, Input } from "react-native-elements";
import RNPickerSelect from "react-native-picker-select";
import * as ImagePicker from "expo-image-picker";
import { FirebaseContext } from "common/src";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ActionSheet from "react-native-actions-sheet";
import i18n from "i18n-js";
import { Ionicons } from "@expo/vector-icons";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
var { height, width } = Dimensions.get("window");

export default function ConvertDriver(props) {
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;
  const { api, appcat } = useContext(FirebaseContext);
  const settings = useSelector((state) => state.settingsdata.settings);
  const dispatch = useDispatch();
  const { signOut, updateProfile } = api;
  const [isSelected, setSelection] = useState(false);

  const [state, setState] = useState({
    taxiProCardImage: null,
    idImage: null,
    parkingCardImage: null,
    insuranceCertificateImage: null,
    certificateRcProImage: null,
    kbisOrInseeImage: null,
    registrationCertificateImage: null,
    leaseManagementContractImage: null,
    riBBankAccountImage: null,
    usertype: "driver",
    vehicleNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    carType: null,
    bankAccount: "",
    bankCode: "",
    bankName: "",
    licenseImage: null,
    other_info: "",
    queue: false,
    driverActiveStatus: false,
    numberOfPlace: "",
    vehicleColor: "",
    options: [],
    companyName: "",
    companyAddress: "",
    companyLicenseNumber: "",
  });
  const options = [
    "Aucun",
    "Siège BB",
    "Parle Anglais",
    "Colis non-accompagné",
    "Animal",
    "Conventionné",
  ];
  const [process_step, setProcessStep] = useState(0);

  const cars = useSelector((state) => state.cartypes.cars);
  const auth = useSelector((state) => state.auth);
  const settingsdata = useSelector((state) => state.settingsdata);
  const [carTypes, setCarTypes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const actionSheetRef = useRef(null);
  const [process_image, set_process_image] = useState("");

  useEffect(() => {
    if (auth.info && auth.info.profile && auth.info.profile.licenseImage) {
      setLoading(false);
      props.navigation.navigate("Intro");
      dispatch(signOut());
    }
  }, [auth.info]);

  useEffect(() => {
    if (cars) {
      let arr = [];
      for (let i = 0; i < cars.length; i++) {
        arr.push({ label: cars[i].name, value: cars[i].name });
      }
      if (arr.length > 0) {
        setState({ ...state, carType: arr[0].value });
      }
      setCarTypes(arr);
    }
  }, [cars]);

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
            {carTypes ? (
              <RadioForm
                radio_props={carTypes}
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
                    isChecked={state.options.includes(item)}
                    // color={"#28c40b"}
                    // checkedColor={colors.PROFILE_PLACEHOLDER_CONTENT}
                    onClick={(value) => {
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
                    marginTop: 20,
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

  const showActionSheet = () => {
    actionSheetRef.current?.setModalVisible(true);
  };
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

  const uploadImage = () => {
    return (
      <ActionSheet ref={actionSheetRef}>
        <TouchableOpacity
          style={{
            width: "90%",
            alignSelf: "center",
            paddingLeft: 20,
            paddingRight: 20,
            borderColor: colors.CONVERTDRIVER_TEXT,
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
            borderColor: colors.CONVERTDRIVER_TEXT,
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
          <Text style={{ color: "red", fontWeight: "bold" }}>
            {t("cancel")}
          </Text>
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
        base64: true,
        quality: 1.0,
      });

      actionSheetRef.current?.setModalVisible(false);

      if (!result.cancelled) {
        let data = "data:image/jpeg;base64," + result.base64;
        // setCapturedImage(result.uri);
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function () {
            Alert.alert(t("alert"), t("image_upload_error"));
            setLoader(false);
          };
          xhr.responseType = "blob";
          xhr.open("GET", Platform.OS == "ios" ? data : result.uri, true);
          xhr.send(null);
        });
        if (blob) {
          setState({ ...state, [process_image + "Image"]: blob });
        }
      }
    } else {
      Alert.alert(t("alert"), t("camera_permission_error"));
    }
  };

  //upload cancel
  const cancelPhoto = () => {
    setCapturedImage(null);
  };

  //register button press for validation
  const onPressRegister = () => {
    if (state.licenseImage == null) {
      Alert.alert(t("alert"), t("proper_input_licenseimage"));
    } else {
      if (state.vehicleNumber.length > 1) {
        setLoading(true);
        dispatch(
          updateProfile(auth.info, {
            ...state,
            approved: !settingsdata.settings.driver_approval,
          })
        );
      } else {
        Alert.alert(t("alert"), t("proper_input_vehicleno"));
      }
    }
  };

  const lCom = {
    icon: "ios-arrow-back",
    type: "ionicon",
    color: colors.PRIMARY,
    size: 30,
    component: TouchableWithoutFeedback,
    onPress: () => {
      props.navigation.goBack();
    },
  };

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.WHITE}
        leftComponent={isRTL ? null : lCom}
        rightComponent={isRTL ? lCom : null}
        centerComponent={
          <Text style={styles.headerTitleStyle}>{t("convert_to_driver")}</Text>
        }
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />
      <KeyboardAvoidingView
        style={styles.form}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ justifyContent: "center" }}
          style={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {uploadImage()}

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
                {render_step(i)}
              </View>
            ))}
          </RadioForm>

          <View style={styles.checkboxContainer}>
            <CheckBox
              disabled={false}
              isChecked={isSelected}
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
              title={"Valider"}
              disabled={!isSelected}
              loading={loading}
              titleStyle={styles.buttonTitle}
              buttonStyle={styles.registerButton}
            />
          </View>
          <View style={styles.gapView} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },

  form: {
    flex: 1,
  },

  scrollViewStyle: {
    width: width - 40,
    alignSelf: "center",
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
  registerButton: {
    backgroundColor: "#72C048",
    // width: 230,
    height: 50,
    borderColor: colors.TRANSPARENT,
    borderWidth: 0,
    marginTop: 30,
    borderRadius: 24,
  },
  buttonTitle: {
    fontSize: 16,
  },
  textInputContainerStyle: {
    alignItems: "center",
    paddingTop: 10,
  },
  inputTextStyle: {
    color: colors.BLACK,
    fontSize: 13,
    marginLeft: 0,
    height: 32,
  },
  inputContainerDriver: {
    borderWidth: 1,
    borderColor: colors.PRIMARY,
    borderRadius: 5,
    marginTop: 10,
    paddingLeft: 10,
    paddingTop: 5,
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
});
