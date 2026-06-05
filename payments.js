(function () {
  const defaults = {
    currencyCode: "USD",
    countryCode: "US",
    merchantName: "FlavorCNC Trends",
    googlePayEnvironment: "TEST"
  };

  window.PAYMENT_CONFIG = Object.assign({}, defaults, window.PAYMENT_CONFIG || {});

  const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
  };

  const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
  const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

  const baseCardPaymentMethod = {
    type: "CARD",
    parameters: {
      allowedAuthMethods: allowedCardAuthMethods,
      allowedCardNetworks: allowedCardNetworks
    }
  };

  const cardPaymentMethod = Object.assign({}, baseCardPaymentMethod, {
    tokenizationSpecification: {
      type: "PAYMENT_GATEWAY",
      parameters: {
        gateway: "example",
        gatewayMerchantId: "exampleGatewayMerchantId"
      }
    }
  });

  let paymentsClient;

  function formatAmount(amount) {
    return Number(amount || 0).toFixed(2);
  }

  function resetContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }
    return container;
  }

  function getPaymentsClient(config) {
    if (!paymentsClient && window.google && window.google.payments && window.google.payments.api) {
      paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: config.googlePayEnvironment
      });
    }
    return paymentsClient;
  }

  function getGooglePaymentDataRequest(amount, config) {
    return Object.assign({}, baseRequest, {
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPriceLabel: "Total",
        totalPrice: formatAmount(amount),
        currencyCode: config.currencyCode,
        countryCode: config.countryCode
      },
      merchantInfo: {
        merchantName: config.merchantName
      }
    });
  }

  async function mountPayPal(options) {
    const container = resetContainer(options.containerId);
    if (!container) {
      return;
    }

    if (!window.paypal || !window.paypal.Buttons) {
      container.textContent = "PayPal SDK is unavailable. Check connection or SDK script.";
      if (options.onError) {
        options.onError("PayPal SDK unavailable.");
      }
      return;
    }

    try {
      await window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "pill",
          label: "paypal"
        },
        createOrder: function (_, actions) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: formatAmount(options.getAmount())
                }
              }
            ]
          });
        },
        onApprove: async function (_, actions) {
          const order = await actions.order.capture();
          if (options.onSuccess) {
            options.onSuccess({
              provider: "PayPal",
              details: order
            });
          }
        },
        onError: function (err) {
          if (options.onError) {
            options.onError("PayPal checkout error: " + (err && err.message ? err.message : "Unknown error."));
          }
        }
      }).render("#" + options.containerId);
    } catch (err) {
      container.textContent = "Unable to initialize PayPal button.";
      if (options.onError) {
        options.onError("PayPal setup error: " + (err && err.message ? err.message : "Unknown error."));
      }
    }
  }

  async function mountGooglePay(options) {
    const container = resetContainer(options.containerId);
    if (!container) {
      return;
    }

    if (!window.google || !window.google.payments || !window.google.payments.api) {
      container.textContent = "Google Pay SDK is unavailable. Check connection or SDK script.";
      if (options.onError) {
        options.onError("Google Pay SDK unavailable.");
      }
      return;
    }

    const config = Object.assign({}, defaults, window.PAYMENT_CONFIG || {});
    const client = getPaymentsClient(config);

    try {
      const ready = await client.isReadyToPay(
        Object.assign({}, baseRequest, {
          allowedPaymentMethods: [baseCardPaymentMethod]
        })
      );

      if (!ready.result) {
        container.textContent = "Google Pay is not available on this device/browser.";
        return;
      }

      const button = client.createButton({
        buttonType: "buy",
        buttonColor: "black",
        buttonRadius: 8,
        onClick: async function () {
          try {
            const paymentDataRequest = getGooglePaymentDataRequest(options.getAmount(), config);
            const paymentData = await client.loadPaymentData(paymentDataRequest);
            if (options.onSuccess) {
              options.onSuccess({
                provider: "Google Pay",
                details: paymentData
              });
            }
          } catch (err) {
            if (err && err.statusCode === "CANCELED") {
              return;
            }
            if (options.onError) {
              options.onError("Google Pay checkout error: " + (err && err.statusMessage ? err.statusMessage : "Unknown error."));
            }
          }
        }
      });

      container.appendChild(button);
    } catch (err) {
      container.textContent = "Unable to initialize Google Pay button.";
      if (options.onError) {
        options.onError("Google Pay setup error: " + (err && err.message ? err.message : "Unknown error."));
      }
    }
  }

  window.PaymentGateway = {
    mountPayPal: mountPayPal,
    mountGooglePay: mountGooglePay
  };
})();
