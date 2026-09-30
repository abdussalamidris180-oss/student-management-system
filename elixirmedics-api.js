(function attachElixirMedicsApi(global) {
  const defaultBaseUrl = "";

  async function request(path, options) {
    const config = {
      method: "GET",
      headers: {},
      ...options
    };

    if (config.body && typeof config.body !== "string" && !(config.body instanceof FormData)) {
      config.headers = {
        "Content-Type": "application/json",
        ...config.headers
      };
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${defaultBaseUrl}${path}`, config);
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const error = new Error((data && data.error) || "Request failed.");
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  function formToObject(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function bindForm(selector, submitter, callbacks) {
    const form = typeof selector === "string" ? document.querySelector(selector) : selector;

    if (!form) {
      return null;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const data = await submitter(formToObject(form));

        if (callbacks && typeof callbacks.onSuccess === "function") {
          callbacks.onSuccess(data, form);
        }
      } catch (error) {
        if (callbacks && typeof callbacks.onError === "function") {
          callbacks.onError(error, form);
        } else {
          console.error(error);
        }
      }
    });

    return form;
  }

  const api = {
    request,
    health: () => request("/api/health"),
    site: () => request("/api/site"),
    services: () => request("/api/services"),
    doctors: () => request("/api/doctors"),
    faqs: () => request("/api/faqs"),
    testimonials: () => request("/api/testimonials"),
    appointments: () => request("/api/appointments"),
    createAppointment: (payload) => request("/api/appointments", {
      method: "POST",
      body: payload
    }),
    updateAppointment: (id, payload) => request(`/api/appointments/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: payload
    }),
    deleteAppointment: (id) => request(`/api/appointments/${encodeURIComponent(id)}`, {
      method: "DELETE"
    }),
    contacts: () => request("/api/contacts"),
    createContact: (payload) => request("/api/contact", {
      method: "POST",
      body: payload
    }),
    newsletter: () => request("/api/newsletter"),
    subscribe: (payload) => request("/api/newsletter", {
      method: "POST",
      body: payload
    }),
    unsubscribe: (payload) => request("/api/newsletter/unsubscribe", {
      method: "POST",
      body: payload
    }),
    adminSummary: (apiKey) => request("/api/admin/summary", {
      headers: apiKey ? { "x-admin-key": apiKey } : {}
    }),
    bindForm,
    bindAppointmentForm: (selector, callbacks) => bindForm(selector, api.createAppointment, callbacks),
    bindContactForm: (selector, callbacks) => bindForm(selector, api.createContact, callbacks),
    bindNewsletterForm: (selector, callbacks) => bindForm(selector, api.subscribe, callbacks)
  };

  if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
} else if (typeof window !== "undefined") {
  window.ElixirMedicsApi = api;
}
})();
