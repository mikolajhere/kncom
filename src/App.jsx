import { useState } from "react";
import { UseMultistepForm } from "./components/UseMultistepForm";
import { UserForm } from "./components/UserForm";
import { ThankYouForm } from "./components/ThankYouForm";
import "../src/styles/App.css";
import { useAddHiddenInputs } from "./scripts/Hidden";

const INITIAL_DATA = {
  dataLog: "",
  dataPhone: "",
  dataEmailTemplate: "kancelarianieruchomosci.com.php",
  dataSMSTemplate: "kancelarianieruchomosci.com.php",
  "dataValues[serviceDataType]": 252,
  "dataValues[serviceClientChannel]": 39,
  dataUpdateEmail: "",
  docs: "",
  submit: 1,
  tips: "",
  street: "",
};

export const App = () => {
  const [data, setData] = useState(INITIAL_DATA);

  useAddHiddenInputs("my-form", []);

  const hiddensObj = {};

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = urlParams.get("hash");
    if (hash) {
      setData((prevData) => ({
        ...prevData,
        clientHash: hash,
      }));
      next(); // Move to the next step if hash is present
    }

    setTimeout(() => {
      const hiddens = document.querySelectorAll("input[type='hidden']");
      hiddens.forEach((hidden) => {
        hiddensObj[hidden.name] = hidden.value;
      });
    }, 1);
  }, []);

  function updateFields(fields) {
    setData((prev) => {
      return { ...prev, ...fields };
    });
  }

  const { isFirstStep, step, isLastStep, next } = UseMultistepForm([
    <UserForm key={1} {...data} updateFields={updateFields} />,
    <ThankYouForm key={2} {...data} updateFields={updateFields} />,
  ]);

  function onSubmit(e) {
    e.preventDefault();

    if (isFirstStep) {
      const formData = { ...data, ...hiddensObj };
      console.log({ formData });
      fetch(
        "https://system.pewnylokal.pl/crm/api/newEndpoint.php?format=json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )
        .then((response) => response.json())
        .then((data) => {
          setData({
            clientHash: data.hash,
            submit: 1,
            dataEmailTemplate: "kancelarianieruchomosci.com.php",
          });
          console.log("Endpoint Success: ", data);
        })
        .catch((error) => {
          console.error("Endpoint Error: ", error);
        });
      next();
      setData({
        dataEmailTemplate: "kancelarianieruchomosci.com.php",
        clientHash: data.clientHash,
        submit: 1,
      });
    } else if (!isLastStep) {
      console.log(data);
      fetch("https://system.pewnylokal.pl/crm/api/updateClientData.php?format=json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          response.json();
        })
        .then((data) => {
          console.log("UpdateClientData Success: ", data);
        })
        .catch((error) => {
          console.error("UpdateClientData Error: ", error);
        });
      next();
      setData({
        dataEmailTemplate: "",
        clientHash: data.clientHash,
        submit: 1,
      });
    }
  }

  return (
    <>
      <nav>
        <span>
          Kancelaria <b>Nieruchomości</b>
        </span>
      </nav>
      <div className="container">
        <h1>Formularz kontaktowy</h1>
        <form onSubmit={onSubmit}>
          {step}
          {isLastStep ? (
            <></>
          ) : (
            <div className="tito-container">
              <button className="btn-main" type="submit">
                Wyślij
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
};
