import { useEffect } from "react";

export const useAddHiddenInputs = (formId, updateData) => {
  useEffect(() => {
    console.log("Pewny Lokal Tracker - inicjalizacja");

    const cookiesTags = [
      "serviceUtmSource",
      "serviceUtmMedium",
      "serviceUtmCampaign",
      "serviceUtmTerm",
      "clientFirstVisitPage",
      "clientFirstVisitTime",
      "serviceUtmForm",
    ];

    const setCookie = (cname, cvalue, exdays) => {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      const expires = "expires=" + d.toUTCString();
      const domain =
        location.hostname === "pewnylokal.pl" ? ";domain=.pewnylokal.pl" : "";
      document.cookie = `${cname}=${cvalue};${expires}${domain};path=/`;
    };

    const getCookie = (cname) => {
      const name = cname + "=";
      const ca = document.cookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    };

    if (!getCookie("clientFirstVisitPage")) {
      const now = new Date();
      setCookie("clientFirstVisitPage", window.location.href, 30);
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

    const urlParams = new URLSearchParams(window.location.search);
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "gclid",
      "fbclid",
    ].forEach((param) => {
      if (urlParams.get(param)) {
        setCookie(param, urlParams.get(param), 30);
      }
    });

    if (!getCookie("serviceUtmSource")) {
      if (urlParams.get("gclid")) {
        setCookie("serviceUtmSource", "adwords", 30);
        setCookie("serviceUtmMedium", "paid", 30);
        setCookie("serviceUtmCampaign", "unknown", 30);
        setCookie("serviceUtmTerm", "unknown", 30);
      }
      if (urlParams.get("fbclid")) {
        setCookie("serviceUtmSource", "facebook", 30);
        setCookie("serviceUtmMedium", "social", 30);
        setCookie("serviceUtmCampaign", "unknown", 30);
        setCookie("serviceUtmTerm", "unknown", 30);
      }
    }

    if (!getCookie("serviceUtmSource")) {
      const ref = document.referrer;
      if (ref.includes("google")) {
        setCookie("serviceUtmSource", "google", 30);
        setCookie("serviceUtmMedium", "organic", 30);
        setCookie("serviceUtmCampaign", "seo", 30);
        setCookie("serviceUtmTerm", "unknown", 30);
      }
    }

    setCookie("serviceUtmForm", window.location.href, 1);

    const hiddensObj = {};
    cookiesTags.forEach((tag) => {
      const value = getCookie(tag);
      hiddensObj[`dataValues[${tag}]`] = value || ""; // Set empty string if value is undefined
    });

    // Update the data state in App component
    if (typeof updateData === "function") {
      updateData(hiddensObj);
    }

    // Create and append hidden inputs to the form
    const form = document.querySelector(`#${formId}`);
    if (form) {
      cookiesTags.forEach((tag) => {
        if (!form.querySelector(`[name="dataValues[${tag}]"]`)) {
          const hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.name = `dataValues[${tag}]`;
          hiddenInput.value = getCookie(tag) || ""; // Set empty string if value is undefined
          form.appendChild(hiddenInput);
        }
      });
    }

    const save = (e) => {
      const form = e.target.form;
      if (form) {
        let tekst = `<big><b>Domena: ${window.location.hostname}</b></big>`;
        const inputs = form.querySelectorAll("input,select");
        inputs.forEach((input) => {
          try {
            tekst += `<br>${input.name}: ${input.value}`;
          } catch (Error) {
            console.log(input.name, Error);
          }
        });

        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          "https://pewnylokal.pl/rezerwacja-terminu/include/request.php"
        );
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = () => {
          if (xhr.status === 200) {
            console.log(xhr.responseText);
          } else {
            console.log("Request failed.  Returned status of " + xhr.status);
          }
        };
        xhr.send(
          JSON.stringify({
            hash: form.querySelector("input[name='hash']")?.value || null,
            phone: form.querySelector("input[name='dataPhone']")?.value || null,
            email: form.querySelector("input[name='dataEmail']")?.value || null,
            city:
              form.querySelector(
                "input[name='dataValues[serviceDataAddressCity]']"
              )?.value || null,
            inne_dane: tekst + "<br>dataValues[serviceDataType]:344",
          })
        );
      }
    };

    document
      .querySelectorAll("input:not(.nosave),select:not(.nosave)")
      .forEach((input) => {
        input.addEventListener("change", save);
      });

    console.log("Pewny Lokal Tracker - wykonano");
  }, []); // Empty dependency array to run the effect only once
};
