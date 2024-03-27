import PrimeCatalogContainer from "./../almLib/components/Catalog/PrimeCatalogContainer/PrimeCatalogContainer";
import "../almLib/common/ESCustomHooks";
import Loader from "./loader";
import { useEffect } from "react";
import { updateFiltersOnLoad, useFilter, useSearch } from "../almLib";
import { addMandatoryParams } from "../config";
import { filtersDefaultState } from "../almLib/utils/filters";
import { FilterState, UpdateFiltersEvent } from "../almLib/utils/filters";
import { CatalogFilterState } from "../almLib/store/reducers/catalog";
import { useDispatch } from "react-redux";

const Catalog = (props) => {
  const dispatch = useDispatch();
  const accountJson = props.accountJson;
  const filterPanelSetting = accountJson?.filterPanelSetting;
  const { resetSearch } = useSearch();
  const { updateFilters } = useFilter();

  const resetFilters = () => {
    let defaultFiltersFromState = {
      loTypes: "course,learningProgram,certification,jobAid",
      skillName: "",
      tagName: "",
      catalogs: "",
      duration: "",
      learnerState: "",
      loFormat: "",
      price: "",
      skillLevel: "",
      cities: "",
    };
  
    setTimeout(() => {
      const updatedFilters = { ...defaultFiltersFromState };
      dispatch(updateFiltersOnLoad(updatedFilters));
    }, 0);
  
    let currentFilters = filtersDefaultState;
    for (let [type, value] of Object.entries(currentFilters)) {
      value.list.forEach((element) => {
        let data = {
          filterType: type,
          checked: false,
          label: element.label,
        };
        updateFilters(data, true);
      });
    }
  };

  const resetQueryParams = () => {
    const newurl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      addMandatoryParams() +
      window.location.hash;
    window.history.replaceState({ path: newurl }, "", newurl);
    resetFilters();
  };

  useEffect(() => {
    return () => {
      resetSearch();
      resetFilters();
      resetQueryParams();
    };
  }, []);

  if (!accountJson) {
    return <Loader></Loader>;
  }

  return (
    <div
      className="catalog__container"
      data-show-filters={true}
      data-show-search={true}
      data-catalogs={filterPanelSetting?.catalog}
      data-lo-types={filterPanelSetting?.type}
      data-skill-name={filterPanelSetting?.skill}
      data-lo-format={filterPanelSetting?.format}
      data-duration={filterPanelSetting?.duration}
      data-price={filterPanelSetting?.price}
      data-learner-state="true"
      data-tag-name={filterPanelSetting?.tag}
      data-skill-level={filterPanelSetting?.skillLevel}
      data-cities={filterPanelSetting?.cities}
    >
      <PrimeCatalogContainer almDomain={accountJson?.almDomain} />
    </div>
  );
};
export default Catalog;
