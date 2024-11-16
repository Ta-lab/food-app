import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navdata = () => {
  const history = useNavigate();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);

  const [isCustomerManagement, setIsCustomerManagement] = useState(false);
  const [isFoodItems, setIsFoodItems] = useState(false);
  
  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "CustomerManagement") {
      setIsCustomerManagement(false);
    }
    if (iscurrentState !== "FoodItems") {
      setIsFoodItems(false);
    }
  }, [
    history,
    iscurrentState,
    isDashboard,
    isCustomerManagement,
    isFoodItems,
  ]);

  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
    {
      id: "dashboard",
      label: "Dashboards",
      icon: "bx bxs-dashboard",
      link: "#",
      stateVariables: isDashboard,
      click: function (e) {
        e.preventDefault();
        setIsDashboard(!isDashboard);
        setIscurrentState("Dashboard");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "ecommerce",
          label: "Ecommerce",
          link: "/dashboard",
          parentId: "dashboard",
        },
      ],
    },
    {
      id: "customer-management",
      label: "Customer Management",
      icon: "bx bxs-user",
      link: "#",
      stateVariables: isCustomerManagement,
      click: function (e) {
        e.preventDefault();
        setIsCustomerManagement(!isCustomerManagement);
        setIscurrentState("CustomerManagement");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "customers",
          label: "Customers",
          link: "/customer-list",
          parentId: "customer-management",
        },
      ],
    },
    {
      id: "food-management",
      label: "Food Items",
      icon: "bx bxs-cake",
      link: "#",
      stateVariables: isFoodItems,
      click: function (e) {
        e.preventDefault();
        setIsFoodItems(!isFoodItems);
        setIscurrentState("FoodItems");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "foods",
          label: "Food Item Management",
          link: "/food-list",
          parentId: "food-management",
        },
      ],
    },
  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
