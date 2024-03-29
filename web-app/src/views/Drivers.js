import React, { useState, useEffect, useContext, useRef } from "react";
import MaterialTable from "material-table";
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { FirebaseContext } from "common";
import { useTranslation } from "react-i18next";
import moment from "moment/min/moment-with-locales";

export default function Users() {
  const { api } = useContext(FirebaseContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const { addUser, editUser, deleteUser, checkUserExists, fetchUsersOnce } =
    api;
  const [data, setData] = useState([]);
  const [cars, setCars] = useState({});
  const staticusers = useSelector((state) => state.usersdata.staticusers);
  const cartypes = useSelector((state) => state.cartypes);
  const auth = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.settingsdata.settings);
  const dispatch = useDispatch();
  const loaded = useRef(false);

  useEffect(() => {
    dispatch(fetchUsersOnce());
  }, [dispatch, fetchUsersOnce]);

  useEffect(() => {
    if (staticusers) {
      setData(
        staticusers.filter(
          (user) =>
            user.usertype === "driver" &&
            ((user.fleetadmin === auth.info.uid &&
              auth.info.profile.usertype === "fleetadmin") ||
              auth.info.profile.usertype === "admin")
        )
      );
    } else {
      setData([]);
    }
    loaded.current = true;
  }, [staticusers, auth.info.profile.usertype, auth.info.uid]);

  useEffect(() => {
    if (cartypes.cars) {
      let obj = {};
      cartypes.cars.map((car) => (obj[car.name] = car.name));
      setCars(obj);
    }
  }, [cartypes.cars]);

  const columns = [
    {
      title: t("createdAt"),
      field: "createdAt",
      editable: "never",
      defaultSort: "desc",
      render: (rowData) =>
        rowData.createdAt ? moment(rowData.createdAt).format("lll") : null,
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("first_name"),
      field: "firstName",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("last_name"),
      field: "lastName",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("email"),
      field: "email",
      editable: "onAdd",
      render: (rowData) =>
        settings.AllowCriticalEditsAdmin ? rowData.email : "Hidden for Demo",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
      headerStyle: { textAlign: "center" },
    },
    {
      title: t("mobile"),
      field: "mobile",
      editable: "onAdd",
      render: (rowData) =>
        settings.AllowCriticalEditsAdmin ? rowData.mobile : "Hidden for Demo",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("profile_image"),
      field: "profile_image",
      render: (rowData) =>
        rowData.profile_image ? (
          <img
            alt="Profile"
            src={rowData.profile_image}
            style={{ width: 50, borderRadius: "50%" }}
          />
        ) : null,
      editable: "never",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: "Options",
      field: "options",
      render: (rowData) =>
        rowData.options
          ? rowData.options.map((option) => <span>{option}, </span>)
          : null,
      editable: "never",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },

    {
      title: t("vehicle_model_name"),
      field: "vehicleMake",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("vehicle_model_no"),
      field: "vehicleModel",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("vehicle_reg_no"),
      field: "vehicleNumber",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    // {
    //   title: t("other_info"),
    //   field: "other_info",
    //   initialEditValue: "",
    //   cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    // },
    {
      title: t("car_type"),
      field: "carType",
      lookup: cars,
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("account_approve"),
      field: "approved",
      type: "boolean",
      initialEditValue: true,
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("driver_active"),
      field: "driverActiveStatus",
      type: "boolean",
      initialEditValue: true,
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("lisence_image"),
      field: "licenseImage",
      render: (rowData) =>
        rowData.licenseImage ? (
          <img
            alt="License"
            src={rowData.licenseImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "ID Image",
      field: "idImage",
      render: (rowData) =>
        rowData.idImage ? (
          <img alt="idImage" src={rowData.idImage} style={{ width: 100 }} />
        ) : null,
      editable: "never",
    },
    {
      title: "Insurance Certificate Image",
      field: "insuranceCertificateImage",
      render: (rowData) =>
        rowData.insuranceCertificateImage ? (
          <img
            alt="insuranceCertificateImage"
            src={rowData.insuranceCertificateImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "kbis / Insee Image",
      field: "kbisOrInseeImage",
      render: (rowData) =>
        rowData.kbisOrInseeImage ? (
          <img
            alt="kbisOrInseeImage"
            src={rowData.kbisOrInseeImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },

    {
      title: "Lease Management Contract Image",
      field: "leaseManagementContractImage",
      render: (rowData) =>
        rowData.leaseManagementContractImage ? (
          <img
            alt="leaseManagementContractImage"
            src={rowData.leaseManagementContractImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "Parking Card Image",
      field: "parkingCardImage",
      render: (rowData) =>
        rowData.parkingCardImage ? (
          <img
            alt="parkingCardImage"
            src={rowData.parkingCardImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "Certificate RC Pro Image",
      field: "certificateRcProImage",
      render: (rowData) =>
        rowData.certificateRcProImage ? (
          <img
            alt="Certificate RC Pro"
            src={rowData.certificateRcProImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "Parking Card Image",
      field: "parkingCardImage",
      render: (rowData) =>
        rowData.parkingCardImage ? (
          <img
            alt="Parking Card "
            src={rowData.parkingCardImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "Registration Certificate Image",
      field: "registrationCertificateImage",
      render: (rowData) =>
        rowData.registrationCertificateImage ? (
          <img
            alt="Parking Card "
            src={rowData.registrationCertificateImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "Registration Certificate Image",
      field: "registrationCertificateImage",
      render: (rowData) =>
        rowData.registrationCertificateImage ? (
          <img
            alt="Registration Certificate  "
            src={rowData.registrationCertificateImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "RIB Bank Account Image",
      field: "riBBankAccountImage",
      render: (rowData) =>
        rowData.riBBankAccountImage ? (
          <img
            alt="RIB Bank Account"
            src={rowData.riBBankAccountImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: "Taxi Pro Card Image",
      field: "taxiProCardImage",
      render: (rowData) =>
        rowData.taxiProCardImage ? (
          <img
            alt="RIB Bank Account"
            src={rowData.taxiProCardImage}
            style={{ width: 100 }}
          />
        ) : null,
      editable: "never",
    },
    {
      title: t("wallet_balance"),
      field: "walletBalance",
      type: "numeric",
      editable: "never",
      initialEditValue: 0,
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: "Number of Place",
      field: "numberOfPlace",
      // type: "numeric",
      editable: "never",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: "Company Name",
      field: "companyName",
      // type: "numeric",
      editable: "never",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: "Company Address",
      field: "companyAddress",
      // type: "numeric",
      editable: "never",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: "Company License Number",
      field: "companyLicenseNumber",
      // type: "numeric",
      editable: "never",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: "Vehicle Color",
      field: "vehicleColor",
      // type: "numeric",
      editable: "never",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("you_rated_text"),
      render: (rowData) => (
        <span>{rowData.ratings ? rowData.ratings.userrating : "0"}</span>
      ),
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("signup_via_referral"),
      field: "signupViaReferral",
      editable: "never",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("referralId"),
      field: "referralId",
      editable: "never",
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("bankName"),
      field: "bankName",
      hidden: settings.bank_fields === false ? true : false,
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("bankCode"),
      field: "bankCode",
      hidden: settings.bank_fields === false ? true : false,
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("bankAccount"),
      field: "bankAccount",
      hidden: settings.bank_fields === false ? true : false,
      initialEditValue: "",
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
    {
      title: t("queue"),
      field: "queue",
      type: "boolean",
      initialEditValue: false,
      cellStyle: { textAlign: isRTL === "rtl" ? "right" : "center" },
    },
  ];

  return !loaded.current ? (
    <CircularLoading />
  ) : (
    <MaterialTable
      title={t("drivers")}
      columns={columns}
      style={{ direction: isRTL === "rtl" ? "rtl" : "ltr" }}
      data={data}
      options={{
        exportButton: settings.AllowCriticalEditsAdmin,
        sorting: true,
      }}
      editable={{
        onRowAdd: (newData) =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              checkUserExists(newData).then((res) => {
                if (res.users && res.users.length > 0) {
                  alert(t("user_exists"));
                  reject();
                } else if (res.error) {
                  alert(t("email_or_mobile_issue"));
                  reject();
                } else {
                  newData["createdByAdmin"] = true;
                  newData["usertype"] = "driver";
                  newData["createdAt"] = new Date().toISOString();
                  newData["referralId"] =
                    newData.firstName.toLowerCase() +
                    Math.floor(1000 + Math.random() * 9000).toString();
                  let role = auth.info.profile.usertype;
                  if (role === "fleetadmin") {
                    newData["fleetadmin"] = auth.info.uid;
                  }
                  dispatch(addUser(newData));
                  dispatch(fetchUsersOnce());
                  resolve();
                }
              });
            }, 600);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve();
              dispatch(editUser(oldData.id, newData));
              dispatch(fetchUsersOnce());
            }, 600);
          }),
        onRowDelete: (oldData) =>
          settings.AllowCriticalEditsAdmin
            ? new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  dispatch(deleteUser(oldData.id));
                  dispatch(fetchUsersOnce());
                }, 600);
              })
            : new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  alert(t("demo_mode"));
                }, 600);
              }),
      }}
    />
  );
}
