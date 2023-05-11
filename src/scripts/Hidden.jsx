import { useEffect } from "react";

export const useAddHiddenInputs = (formId, inputs) => {
  useEffect(() => {
    console.log("Pewny Lokal Tracker - inicjalizacja");
    [
      "serviceUtmForm",
      "serviceUtmMedium",
      "serviceUtmCampaign",
      "serviceUtmSource",
      "serviceUtmTerm",
      "clientFirstVisitTime",
      "clientFirstVisitPage",
      "hash",
    ].forEach(function (e) {
      typeof document.getElementsByName("dataValues[" + e + "]")[0] !=
        "undefined" &&
        console.log(
          "Pewny Lokal Tracker - błąd! istnieje pole dataValues[" + e + "]"
        );
    });

    function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      var expires = "expires=" + d.toUTCString();
      if (location.hostname == "pewnylokal.pl") {
        document.cookie =
          cname +
          "=" +
          cvalue +
          ";" +
          expires +
          ";domain=.pewnylokal.pl;path=/";
      } else {
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
      }
    }

    function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return undefined;
    }

    if (typeof getCookie("clientFirstVisitPage") === "undefined") {
      let now = new Date();

      setCookie("clientFirstVisitPage", window.location, 30);
      setCookie(
        "clientFirstVisitTime",
        now.toLocaleDateString("pl-PL", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        }),
        30
      );
    }

    var parts = window.location.search.substring(1).split("&");
    var GET = {};

    for (var i = 0; i < parts.length; i++) {
      var temp = parts[i].split("=");
      GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
    }

    if (typeof GET["utm_source"] !== "undefined") {
      setCookie("serviceUtmSource", GET["utm_source"], 30);
    }
    if (typeof GET["utm_medium"] !== "undefined") {
      setCookie("serviceUtmMedium", GET["utm_medium"], 30);
    }
    if (typeof GET["utm_campaign"] !== "undefined") {
      setCookie("serviceUtmCampaign", GET["utm_campaign"], 30);
    }

    if (typeof GET["utm_term"] !== "undefined") {
      setCookie("serviceUtmTerm", GET["utm_term"], 30);
    }

    if (!getCookie("serviceUtmSource")) {
      if (typeof GET["gclid"] !== "undefined") {
        setCookie("serviceUtmSource", "adwords", 30);
        setCookie("serviceUtmMedium", "paid", 30);
        setCookie("serviceUtmCampaign", "unknown", 30);
        setCookie("serviceUtmTerm", "unknown", 30);
      }
      if (typeof GET["fbclid"] !== "undefined") {
        setCookie("serviceUtmSource", "facebook", 30);
        setCookie("serviceUtmMedium", "social", 30);
        setCookie("serviceUtmCampaign", "unknown", 30);
        setCookie("serviceUtmTerm", "unknown", 30);
      }
    }

    if (!getCookie("serviceUtmSource")) {
      var ref = document.referrer;
      console.log(ref);
      if (ref.includes("google")) {
        setCookie("serviceUtmSource", "google", 30);
        setCookie("serviceUtmMedium", "organic", 30);
        setCookie("serviceUtmCampaign", "seo", 30);
        setCookie("serviceUtmTerm", "unknown", 30);
      }
    }
    setCookie("serviceUtmForm", window.location, 1);

    var cookiesTags = [
      "serviceUtmSource",
      "serviceUtmMedium",
      "serviceUtmCampaign",
      "serviceUtmTerm",
      "clientFirstVisitPage",
      "clientFirstVisitTime",
      "serviceUtmForm",
    ];
    var inputs = [];

    const form = document.querySelector("form");
    if (!form) return;

    for (const i in cookiesTags) {
      if (
        typeof document.getElementsByName(
          "dataValues[" + cookiesTags[i] + "]"
        )[0] == "undefined"
      ) {
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "dataValues[" + cookiesTags[i] + "]";
        hiddenInput.value = getCookie(cookiesTags[i]);
        form.appendChild(hiddenInput);
      }
    }

    // Zapisywanie formularza
    var hash = (Math.random() + 1).toString(36).substring(7);
    var inputHash = document.createElement("input");
    inputHash.setAttribute("type", "hidden");
    inputHash.setAttribute("name", "hash");
    inputHash.setAttribute("value", hash);

    var forms = document.getElementsByTagName("form");
    for (let i = 0; i < forms.length; i++) {
      if (forms[i].getAttribute("method") == "get") {
        continue;
      }

      for (let j = 0; j < inputs.length; j++) {
        let icopy = inputs[j].cloneNode();
        forms[i].appendChild(icopy);
      }
      let icopy = inputHash.cloneNode();

      forms[i].appendChild(icopy);
    }

    if (typeof GET["utm_campaign"] !== "undefined") {
      setCookie("serviceUtmCampaign", GET["utm_campaign"], 30);
    }

    function getValueOrNull(element) {
      try {
        return element.value;
      } catch {
        return null;
      }
    }
    function save(e) {
      var form = e.target.form;
      if (form) {
        var tekst =
          "<big><b>Domena: " + window.location.hostname + "</b></big>";
        var inputs = form.querySelectorAll("input,select");
        for (let i = 0; i < inputs.length; i++) {
          try {
            tekst =
              tekst +
              "<br>" +
              inputs[i].getAttribute("name") +
              ": " +
              inputs[i].value;
          } catch (Error) {
            console.log(inputs[i].getAttribute("name"), Error);
          }
        }

        const xhr = new XMLHttpRequest();

        xhr.open(
          "POST",
          "https://pewnylokal.pl/rezerwacja-terminu/include/request.php"
        );
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function () {
          if (xhr.status === 200) {
            console.log(xhr.responseText);
          } else if (xhr.status !== 200) {
            console.log("Request failed.  Returned status of " + xhr.status);
          }
        };
        xhr.send(
          JSON.stringify({
            hash: getValueOrNull(
              form.querySelectorAll("input[name='hash']")[0]
            ),
            phone: getValueOrNull(
              form.querySelectorAll("input[name='dataPhone']")[0]
            ),
            email: getValueOrNull(
              form.querySelectorAll("input[name='dataEmail']")[0]
            ),
            datalog: getValueOrNull(
              form.querySelectorAll("textarea[name='dataLog']")[0].value
            ),
            inne_dane:
              tekst +
              "<br>dataValues[serviceDataType]:252<br>dataLog:" +
              document.querySelectorAll("textarea[name='dataLog']")[0].value,
          })
        );
      }
    }
    var inputs = document.querySelectorAll(
      "input:not(.nosave),select:not(.nosave)"
    );
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("change", function (e) {
        save(e);
      });
    }

    console.log("Pewny Lokal Tracker - wykonano");
  }, []);
};
