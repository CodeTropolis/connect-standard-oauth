let elmButton = document.querySelector("#submit");

let finalButton = document.querySelector("#final");

if (elmButton) {
  elmButton.addEventListener(
    "click",
    e => {
      elmButton.setAttribute("disabled", "disabled");

      fetch("/get-oauth-link", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.url) {
            window.location = data.url;
            
          } else {
            elmButton.removeAttribute("disabled");
            elmButton.textContent = "<Something went wrong>";
            console.log("data", data);
          }
        });
    },
  );
}

if(finalButton ){
  finalButton.addEventListener(
    "click",
    e => {
      finalButton.setAttribute("disabled", "disabled");

      fetch("/authorize-oauth", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        // .then(data => {
        //   console.log(`@CodeTropolis: data`, data)
        // });
    },
  );
}
