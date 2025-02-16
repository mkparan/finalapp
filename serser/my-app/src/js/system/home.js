import {
  supabase,
  successNotification,
  errorNotification,
  doLogout,
} from "../main";

const itemsImageUrl =
  "https://zslphlqneckdehsvqymy.supabase.co/storage/v1/object/public/service/";

// Load data
getDatas();

// Assign Logout Functionality
const btn_signout = document.getElementById("btn_signout");
btn_signout.onclick = doLogout;

// Search form functionality
const search_form = document.getElementById("search_form");

search_form.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(search_form);

  getDatas(formData.get("keyword"));
};

async function getDatas(keyword = "") {
  // Search or filtering for search
  let { data: services, error } = await supabase
    .from("service")
    .select("*")
    .or(`service_name.ilike.%${keyword}%, description.ilike.%${keyword}%`);

  // Handle potential errors
  if (error) {
    errorNotification("Something went wrong. Could not fetch data!", 10);
    console.log(error);
    return;
  }

  let container = "";
  // Get each service and interpolate with HTML elements
  services.forEach((service) => {
    container += `
    <div>
        <div class="col-sm-12">
            <div class="card w-100 mt-3" data-id="${service.id}">
                <div class="row">
                    <a href="#" class="btn-show card-link" data-id="${
                      service.id
                    }">
                        <div class="col-sm-4">
                            <img src="${
                              itemsImageUrl + service.image_path
                            }" width="100%" height="225px">
                        </div>
                    </a>
                    <div class="col-sm-8">
                        <div class="card-body">

                            <div class="dropdown float-end">
                                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"></button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <a class="dropdown-item btn_save" href="#" data-id="${
                                          service.id
                                        }" data-service-name="${
      service.service_name
    }" data-hourly-rate="${service.hourly_rate}" data-description="${
      service.description
    }" data-facebook="${service.facebook}" data-image="${
      service.image_path
    }">Save</a>
                                    </li>
                                </ul>
                            </div>

                            <h5 class="card-title">${service.service_name}</h5>
                            <h6 class="card-subtitle mb-2 text-body-secondary">
                                <p>Post By: ${service.user_id}</p>
                                <p>PHP ${service.hourly_rate}</p>
                            </h6>
                            <p class="card-text">${service.description}</p>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
  });

  // Assign container elements to be displayed
  document.getElementById("get_data").innerHTML = container;

  // Assign click event on show service buttons
  document.querySelectorAll(".btn-show").forEach((element) => {
    element.addEventListener("click", showService);
  });

  // Event delegation for save button click
  document
    .getElementById("get_data")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("btn_save")) {
        saveAction(event);
      }
    });
}

const saveAction = async (e) => {
  e.preventDefault();
  const id = e.target.getAttribute("data-id");
  const service_name = e.target.getAttribute("data-service-name");
  const hourly_rate = e.target.getAttribute("data-hourly-rate");
  const description = e.target.getAttribute("data-description");
  const facebook = e.target.getAttribute("data-facebook");
  const image_path = e.target.getAttribute("data-image");

  const { data, error } = await supabase
    .from("save")
    .insert([
      {
        id: id,
        service_name: service_name,
        hourly_rate: hourly_rate,
        description: description,
        facebook: facebook,
        image_path: image_path,
      },
    ])
    .select();

  if (error == null) {
    // Show success notification
    successNotification("Service Successfully Saved!", 15);

    // Reload data
    getDatas();
  } else {
    // Show error notification
    errorNotification("Service already saved!", 10);
    console.log(error);
  }
};

const showService = async (e) => {
  e.preventDefault();
  const id = e.currentTarget.getAttribute("data-id");

  // Show loading spinner
  document.getElementById("loading_spinner").style.display = "block";
  document.getElementById("service_details").style.display = "none";

  // Supabase show by id
  let { data: service, error } = await supabase
    .from("service")
    .select("*")
    .eq("id", id);

  if (error == null) {
    // Populate service details
    document.getElementById("service_name_display").textContent =
      service[0].service_name;
    document.getElementById(
      "hourly_rate_display"
    ).textContent = `PHP ${service[0].hourly_rate}`;
    document.getElementById("description_display").textContent =
      service[0].description;
    document.getElementById("image_display").src =
      itemsImageUrl + service[0].image_path;

    // Populate Facebook link if available
    const facebookLinkElement = document.getElementById("facebook_link");
    if (service[0].facebook) {
      facebookLinkElement.href = service[0].facebook;
      facebookLinkElement.style.display = "block";
    } else {
      facebookLinkElement.style.display = "none";
    }

    // Hide loading spinner and show service details
    document.getElementById("loading_spinner").style.display = "none";
    document.getElementById("service_details").style.display = "block";
  } else {
    // Show error notification
    errorNotification("Something went wrong. Service cannot be showed!", 10);
    console.log(error);
  }

  // Show the modal
  const modalShowButton = document.getElementById("modal_show");
  modalShowButton.click();
};

console.log("fav.js script execution completed");
