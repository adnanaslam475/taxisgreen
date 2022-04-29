import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import ActionSheet from "react-native-actions-sheet";

import { Icon, Button, Header, Input } from "react-native-elements";
import { colors } from "../common/theme";
import i18n from "i18n-js";
import RadioForm, {
  RadioButton,
  RadioButtonInput,
  RadioButtonLabel,
} from "react-native-simple-radio-button";
import CheckBox from "react-native-check-box";

// var { height } = Dimensions.get("window");
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from "common/src";

export default function EditProfilePage(props) {
  const { api } = useContext(FirebaseContext);
  const { updateProfile } = api;
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [profileData, setProfileData] = useState(null);
  const { t } = i18n;
  const isRTL =
    i18n.locale.indexOf("he") === 0 || i18n.locale.indexOf("ar") === 0;

  const [process_step, setProcessStep] = useState(0);

  const options = [
    "Aucun",
    "Siège BB",
    "Parle Anglais",
    "Colis non-accompagné",
    "Animal",
    "Conventionné",
  ];

  useEffect(() => {
    if (auth.info && auth.info.profile) {
      setProfileData({
        firstName:
          !auth.info.profile.firstName || auth.info.profile.firstName === " "
            ? ""
            : auth.info.profile.firstName,
        lastName:
          !auth.info.profile.lastName || auth.info.profile.lastName === " "
            ? ""
            : auth.info.profile.lastName,
        email:
          !auth.info.profile.email || auth.info.profile.email === " "
            ? ""
            : auth.info.profile.email,
        mobile:
          !auth.info.profile.mobile || auth.info.profile.mobile === " "
            ? ""
            : auth.info.profile.mobile,
        loginType: auth.info.profile.loginType ? "social" : "email",
        usertype: auth.info.profile.usertype,
        uid: auth.info.uid,
        carType: auth.info.profile.carType ? auth.info.profile.carType : null,
        vehicleMake: auth.info.profile.vehicleMake
          ? auth.info.profile.vehicleMake
          : null,
        vehicleModel: auth.info.profile.vehicleModel
          ? auth.info.profile.vehicleModel
          : null,
        vehicleNumber: auth.info.profile.vehicleNumber
          ? auth.info.profile.vehicleNumber
          : null,
        numberOfPlace: auth.info.profile.numberOfPlace
          ? auth.info.profile.numberOfPlace
          : null,
        vehicleColor: auth.info.profile.vehicleColor
          ? auth.info.profile.vehicleColor
          : null,
        options: auth.info.profile.options ? auth.info.profile.options : null,
        companyName: auth.info.profile.companyName
          ? auth.info.profile.companyName
          : null,
        comanyAddress: auth.info.profile.comanyAddress
          ? auth.info.profile.comanyAddress
          : null,
        comanyLicenseNumber: auth.info.profile.comanyLicenseNumber
          ? auth.info.profile.comanyLicenseNumber
          : null,
        certificateRcProImage: auth.info.profile.certificateRcProImage
          ? auth.info.profile.certificateRcProImage
          : null,
        taxiProCardImage: auth.info.profile.taxiProCardImage
          ? auth.info.profile.taxiProCardImage
          : null,
        riBBankAccountImage: auth.info.profile.riBBankAccountImage
          ? auth.info.profile.riBBankAccountImage
          : null,

        registrationCertificateImage: auth.info.profile
          .registrationCertificateImage
          ? auth.info.profile.registrationCertificateImage
          : null,
        licenseImage: auth.info.profile.licenseImage
          ? auth.info.profile.licenseImage
          : null,
        kbisOrInseeImage: auth.info.profile.kbisOrInseeImage
          ? auth.info.profile.kbisOrInseeImage
          : null,
        parkingCardImage: auth.info.profile.parkingCardImage
          ? auth.info.profile.parkingCardImage
          : null,
        insuranceCertificateImage: auth.info.profile.insuranceCertificateImage
          ? auth.info.profile.insuranceCertificateImage
          : null,

        idImage: auth.info.profile.idImage ? auth.info.profile.idImage : null,
        leaseManagementContractImage: auth.info.profile
          .leaseManagementContractImage
          ? auth.info.profile.leaseManagementContractImage
          : null,
      });
    }
  }, [auth.info, auth.email]);

  // email validation
  const validateEmail = (email) => {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailValid = re.test(email);
    return emailValid;
  };

  //register button click after all validation
  const saveProfile = async () => {
    if (
      profileData.firstName &&
      profileData.firstName.length > 0 &&
      profileData.firstName &&
      profileData.firstName.length > 0 &&
      profileData.mobile &&
      profileData.mobile.length &&
      validateEmail(profileData.email)
    ) {
      let userData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        mobile: profileData.mobile,
        email: profileData.email,
        carType: profileData.carType,
        vehicleMake: profileData.vehicleMake,
        vehicleModel: profileData.vehicleModel,
        vehicleNumber: profileData.vehicleNumber,
        numberOfPlace: profileData.numberOfPlace,
        vehicleColor: profileData.vehicleColor,
        options: profileData.options,
        companyName: profileData.companyName,
        companyAddress: profileData.companyAddress,
        companyLicenseNumber: profileData.companyLicenseNumber,
        certificateRcProImage: profileData.certificateRcProImage,
        taxiProCardImage: profileData.taxiProCardImage,
        riBBankAccountImage: profileData.riBBankAccountImage,
        registrationCertificateImage: profileData.registrationCertificateImage,
        licenseImage: profileData.licenseImage,
        kbisOrInseeImage: profileData.kbisOrInseeImage,
        parkingCardImage: profileData.parkingCardImage,
        insuranceCertificateImage: profileData.insuranceCertificateImage,
        idImage: profileData.idImage,
        leaseManagementContractImage: profileData.leaseManagementContractImage,
      };
      console.log(userData);
      dispatch(updateProfile(auth.info, userData));
      Alert.alert(t("alert"), t("profile_updated"));
      props.navigation.pop();
    } else {
      Alert.alert(t("alert"), t("no_details_error"));
    }
  };

  const conleft = {
    flexDirection: "row-reverse",
    padding: 5,
  };
  const conright = {
    flexDirection: "row",
    padding: 5,
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
  const showActionSheet = () => {
    // !(auth && auth.info && auth.info.profile && auth.info.profile.approved) &&
    // actionSheetRef.current?.setModalVisible(false);
  };
  const actionSheetRef = useRef(null);
  const [process_image, set_process_image] = useState("");
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
          setProfileData({ ...profileData, [newKey]: blob });
        }
      }
    } else {
      Alert.alert(t("alert"), t("camera_permission_error"));
    }
  };
  const render_step = (i) => {
    if (i === 0 && process_step === 0) {
      return props.cars ? (
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
          disabled={true}
          onPress={(value) => {
            // setProfileData({ ...profileData, carType: value });
          }}
        />
      ) : null;
    } else if (i === 1 && process_step === 1) {
      return (
        <Input
          editable={false}
          returnKeyType={"next"}
          // underlineColorAndroid={colors.TRANSPARENT}

          placeholder={"Renault"}
          placeholderTextColor={colors.BLACK}
          value={profileData && profileData.vehicleMake}
          inputStyle={[
            styles.inputTextStyle,
            { textAlign: isRTL ? "right" : "left" },
          ]}
          onChangeText={(text) => {
            setProfileData({ ...profileData, vehicleMake: text });
          }}
          inputContainerStyle={[
            styles.inputContainerDriver,
            {
              width: "50%",
            },
          ]}
          containerStyle={styles.textInputStyle}
        />
      );
    } else if (i === 2 && process_step === 2) {
      return (
        <Input
          editable={false}
          // underlineColorAndroid={colors.TRANSPARENT}
          placeholder={"8877090"}
          placeholderTextColor={colors.BLACK}
          value={profileData.vehicleModel}
          inputStyle={[
            styles.inputTextStyle,
            { textAlign: isRTL ? "right" : "left" },
          ]}
          onChangeText={(text) => {
            setProfileData({ ...profileData, vehicleModel: text });
          }}
          inputContainerStyle={[
            styles.inputContainerDriver,
            {
              width: "50%",
            },
          ]}
          containerStyle={styles.textInputStyle}
        />
      );
    } else if (i === 3 && process_step === 3) {
      return (
        <Input
          editable={false}
          // underlineColorAndroid={colors.TRANSPARENT}
          placeholder={"87HDBD"}
          placeholderTextColor={colors.BLACK}
          value={profileData.vehicleNumber}
          inputStyle={[
            styles.inputTextStyle,
            { textAlign: isRTL ? "right" : "left" },
          ]}
          onChangeText={(text) => {
            setProfileData({ ...profileData, vehicleNumber: text });
          }}
          inputContainerStyle={[
            styles.inputContainerDriver,
            {
              width: "50%",
            },
          ]}
          containerStyle={styles.textInputStyle}
        />
      );
    } else if (i === 4 && process_step === 4) {
      return (
        <Input
          editable={false}
          // underlineColorAndroid={colors.TRANSPARENT}
          placeholder={"4"}
          placeholderTextColor={colors.BLACK}
          value={profileData.numberOfPlace}
          inputStyle={[
            styles.inputTextStyle,
            { textAlign: isRTL ? "right" : "left" },
          ]}
          onChangeText={(text) => {
            setProfileData({ ...profileData, numberOfPlace: text });
          }}
          inputContainerStyle={[
            styles.inputContainerDriver,
            {
              width: "50%",
            },
          ]}
          containerStyle={styles.textInputStyle}
        />
      );
    } else if (i === 5 && process_step === 5) {
      return (
        <Input
          editable={false}
          // underlineColorAndroid={colors.TRANSPARENT}
          placeholder={"Green"}
          placeholderTextColor={colors.BLACK}
          value={profileData.vehicleColor}
          inputStyle={[
            styles.inputTextStyle,
            { textAlign: isRTL ? "right" : "left" },
          ]}
          onChangeText={(text) => {
            setProfileData({ ...profileData, vehicleColor: text });
          }}
          inputContainerStyle={[
            styles.inputContainerDriver,
            {
              width: "50%",
            },
          ]}
          containerStyle={styles.textInputStyle}
        />
      );
    } else if (i === 6 && process_step === 6) {
      return (
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
                  disabled={true}
                  style={{ padding: 2 }}
                  isChecked={profileData.options.includes(item)}
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
                  disabled={true}
                  style={{ padding: 2 }}
                  isChecked={profileData.options.includes(item)}
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
              editable={false}
              // underlineColorAndroid={colors.TRANSPARENT}
              placeholder={"Azerty"}
              placeholderTextColor={colors.BLACK}
              value={profileData.companyName}
              inputStyle={[
                styles.inputTextStyle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
              onChangeText={(text) => {
                setProfileData({ ...profileData, companyName: text });
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
              editable={false}
              // underlineColorAndroid={colors.TRANSPARENT}
              placeholder={"95, Rue Paris"}
              placeholderTextColor={colors.BLACK}
              value={profileData.companyAddress}
              inputStyle={[
                styles.inputTextStyle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
              onChangeText={(text) => {
                setProfileData({ ...profileData, companyAddress: text });
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
              editable={false}
              // underlineColorAndroid={colors.TRANSPARENT}
              placeholder={"676960554"}
              placeholderTextColor={colors.BLACK}
              value={profileData.companyLicenseNumber}
              inputStyle={[
                styles.inputTextStyle,
                { textAlign: isRTL ? "right" : "left" },
              ]}
              onChangeText={(text) => {
                setProfileData({ ...profileData, companyLicenseNumber: text });
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
                    marginBottom: 10,
                  },

                  isRTL ? { marginRight: 20 } : { marginLeft: 20 },
                ]}
              >
                Ajouter
              </Text>
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("taxiProCard");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("license");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("id");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("parkingCard");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("insuranceCertificate");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("certificateRcPro");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("kbisOrInsee");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("registrationCertificate");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("leaseManagementContract");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
              <Icon
                name="upload"
                type="font-awesome"
                color={colors.PRIMARY}
                size={24}
                // onPress={() => {
                //   /* upload documents */
                //   set_process_image("riBBankAccount");

                //   showActionSheet();
                // }}
                containerStyle={[styles.iconContainer]}
              />
            </View>
          </View>
        </View>
      );
    }
  };
  return (
    <View style={styles.main}>
      {/* <Header
                backgroundColor={colors.TRANSPARENT}
                leftComponent={isRTL ? null:lCom}
                rightComponent={isRTL? rCom:null}
                containerStyle={styles.headerContainerStyle}
                innerContainerStyles={styles.headerInnerContainer}
            /> */}
      <ScrollView style={styles.scrollViewStyle}>
        {/* <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "height" : "padding"}
          style={styles.form}
        > */}
        <View style={styles.containerStyle}>
          {/* <Text style={styles.headerStyle}>{t("update_profile_title")}</Text> */}
          <Text style={styles.headerStyle}>{t("first_name_placeholder")}</Text>

          <View style={[isRTL ? conleft : conright]}>
            <Icon
              name="user"
              type="font-awesome"
              color={colors.PRIMARY}
              size={30}
              containerStyle={styles.iconContainer}
            />
            <Input
              editable={
                !(
                  auth &&
                  auth.info &&
                  auth.info.profile &&
                  auth.info.profile.approved
                )
              }
              underlineColorAndroid={colors.TRANSPARENT}
              placeholder={t("first_name_placeholder")}
              placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
              value={
                profileData && profileData.firstName
                  ? profileData.firstName
                  : ""
              }
              keyboardType={"email-address"}
              inputStyle={
                (styles.inputTextStyle,
                [
                  isRTL
                    ? { textAlign: "right", fontSize: 13 }
                    : { textAlign: "left", fontSize: 13 },
                ])
              }
              onChangeText={(text) => {
                setProfileData({ ...profileData, firstName: text });
              }}
              secureTextEntry={false}
              errorStyle={styles.errorMessageStyle}
              inputContainerStyle={styles.inputContainerStyle}
              containerStyle={styles.textInputStyle}
            />
          </View>
          <Text style={styles.headerStyle}>{t("last_name_placeholder")}</Text>
          <View style={[isRTL ? conleft : conright]}>
            <Icon
              name="user"
              type="font-awesome"
              color={colors.PRIMARY}
              size={30}
              containerStyle={styles.iconContainer}
            />
            <Input
              editable={
                !(
                  auth &&
                  auth.info &&
                  auth.info.profile &&
                  auth.info.profile.approved
                )
              }
              underlineColorAndroid={colors.TRANSPARENT}
              placeholder={t("last_name_placeholder")}
              placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
              value={
                profileData && profileData.lastName ? profileData.lastName : ""
              }
              keyboardType={"email-address"}
              inputStyle={
                (styles.inputTextStyle,
                [
                  isRTL
                    ? { textAlign: "right", fontSize: 13 }
                    : { textAlign: "left", fontSize: 13 },
                ])
              }
              onChangeText={(text) => {
                setProfileData({ ...profileData, lastName: text });
              }}
              secureTextEntry={false}
              errorStyle={styles.errorMessageStyle}
              inputContainerStyle={styles.inputContainerStyle}
              containerStyle={styles.textInputStyle}
            />
          </View>
          <Text style={styles.headerStyle}>{t("email_placeholder")}</Text>
          <View style={[isRTL ? conleft : conright]}>
            <Icon
              name="envelope"
              type="font-awesome"
              color={colors.PRIMARY}
              size={25}
              containerStyle={styles.iconContainer}
            />
            <Input
              editable={
                profileData && profileData.loginType == "social"
                  ? true
                  : false &&
                    !(
                      auth &&
                      auth.info &&
                      auth.info.profile &&
                      auth.info.profile.approved
                    )
              }
              underlineColorAndroid={colors.TRANSPARENT}
              placeholder={t("email_placeholder")}
              placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
              value={profileData && profileData.email ? profileData.email : ""}
              keyboardType={"email-address"}
              inputStyle={
                (styles.inputTextStyle,
                [
                  isRTL
                    ? { textAlign: "right", fontSize: 13 }
                    : { textAlign: "left", fontSize: 13 },
                ])
              }
              onChangeText={(text) => {
                setProfileData({ ...profileData, email: text });
              }}
              secureTextEntry={false}
              blurOnSubmit={true}
              errorStyle={styles.errorMessageStyle}
              inputContainerStyle={styles.inputContainerStyle}
              containerStyle={styles.textInputStyle}
            />
          </View>
          <Text style={styles.headerStyle}>{t("mobile_no_placeholder")}</Text>

          <View style={[isRTL ? conleft : conright]}>
            <Icon
              name="mobile-phone"
              type="font-awesome"
              color={colors.PRIMARY}
              size={40}
              containerStyle={styles.iconContainer}
            />
            <Input
              editable={
                profileData && profileData.loginType == "social"
                  ? true
                  : false &&
                    !(
                      auth &&
                      auth.info &&
                      auth.info.profile &&
                      auth.info.profile.approved
                    )
              }
              underlineColorAndroid={colors.TRANSPARENT}
              placeholder={t("mobile_no_placeholder")}
              placeholderTextColor={colors.PROFILE_PLACEHOLDER_TEXT}
              value={
                profileData && profileData.mobile ? profileData.mobile : ""
              }
              keyboardType={"number-pad"}
              inputStyle={
                (styles.inputTextStyle,
                [
                  isRTL
                    ? { textAlign: "right", fontSize: 13 }
                    : { textAlign: "left", fontSize: 13 },
                ])
              }
              onChangeText={(text) => {
                setProfileData({ ...profileData, mobile: text });
              }}
              secureTextEntry={false}
              errorStyle={styles.errorMessageStyle}
              inputContainerStyle={styles.inputContainerStyle}
              containerStyle={styles.textInputStyle}
            />
          </View>

          {profileData && profileData.usertype === "driver" ? (
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
                  {profileData &&
                    profileData.usertype === "driver" &&
                    render_step(i)}
                </View>
              ))}
            </RadioForm>
          ) : null}
          {uploadImage()}

          {!(
            auth &&
            auth.info &&
            auth.info.profile &&
            auth.info.profile.approved
          ) && (
            <View style={styles.buttonContainer}>
              <Button
                onPress={saveProfile}
                title={"Save"}
                titleStyle={styles.buttonTitle}
                buttonStyle={styles.registerButton}
              />
            </View>
          )}
        </View>
        {/* </KeyboardAvoidingView> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  headerContainerStyle: {
    backgroundColor: colors.TRANSPARENT,
    borderBottomWidth: 0,
  },
  headerInnerContainer: {
    marginLeft: 10,
    marginRight: 10,
  },
  inputContainerStyle: {
    // flex: 1,
  },
  textInputStyle: {
    // marginLeft: 10,
  },
  iconContainer: {
    paddingTop: 8,
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
    backgroundColor: colors.PRIMARY,
    width: 250,
    height: 45,
    borderColor: colors.TRANSPARENT,
    borderWidth: 0,
    marginTop: 30,
    borderRadius: 20,
    elevation: 0,
  },
  buttonTitle: {
    fontSize: 16,
  },
  inputTextStyle: {
    color: colors.PROFILE_PLACEHOLDER_TEXT,
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
    marginHorizontal: 20,
    // borderWidth: 0,
  },
  form: {
    flex: 1,
  },
  logo: {
    width: "90%",
    justifyContent: "flex-start",
    marginTop: 10,
    alignItems: "center",
  },
  scrollViewStyle: {
    // height: height,
  },
  textInputContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 15,
  },
  headerStyle: {
    fontSize: 15,
    color: colors.MAP_TEXT,
    // textAlign: "center",
    flexDirection: "row",
    marginTop: 0,
  },
  text1: {
    fontSize: 17,
    left: 10,
    color: colors.PROFILE_PLACEHOLDER_CONTENT,
    fontFamily: "Roboto-Bold",
  },
  textInputContainerStyle: {
    alignItems: "center",
    paddingTop: 10,
  },
  radioText: { fontSize: 16, fontFamily: "Roboto-Bold", color: colors.BLACK },
  inputTextStyle: {
    color: colors.BLACK,
    fontSize: 13,
    marginLeft: 0,
    height: 32,
  },
  textInputStyle: {
    marginLeft: 10,
  },
  inputContainerDriver: {
    borderWidth: 1,
    borderColor: colors.PRIMARY,
    borderRadius: 5,
    marginTop: 10,
    paddingLeft: 10,
    paddingTop: 5,
  },
});
