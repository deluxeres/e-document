import React, { useState, useEffect } from "react";
import { store } from "./pages/Admin/store";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

function Card() {
  const [string, setString] = useState("");

  useEffect(() => {
    const fieldData = store({ type: "" });
    setString(fieldData);
  }, []);


  return (
    <Tabs variant="soft-rounded" colorScheme="green" style={{padding: "0", display: "flex", width: "90%", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
      <TabList>
        <Tab>Паспорт</Tab>
        <Tab>Водiйське подсвiдчення</Tab>
      </TabList>
      <TabPanels style={{marginTop: "20px"}}>
        <TabPanel>
          <div className="card">
            <div className="card-wrapper">
              <div className="card-header">
                <span className="card-country">{string.inputFlag} {string.inputCountry}</span>
                <p>Паспорт</p>
              </div>
              <div className="card-general">
                <div className="card-info__top">
                  <div className="card-info__img">
                    <img src={string.inputPhoto} alt="img" />
                  </div>
                  <div className="card-info__text">
                    <div className="card-info__text__birth">
                      <span className="card-info__title">Дата народження:</span>
                      <span className="card-info__subtitle">
                        {string.inputBirth}
                      </span>
                    </div>
                    <div className="card-info__text__expiry">
                      <span className="card-info__title">Дiйсний до:</span>
                      <span className="card-info__subtitle">
                        {string.inputExpiry}
                      </span>
                    </div>
                    <div className="card-info__text__sex">
                      <span className="card-info__title">Стать:</span>
                      <span className="card-info__subtitle">
                        {string.inputSex}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-info__bottom">
                  <div className="card-info__text__surname">
                    <span className="card-info__title">Прiзвище/Surname</span>
                    <span className="card-info__subtitle">
                      {string.inputSurname}
                    </span>
                  </div>
                  <div className="card-info__text__name">
                    <span className="card-info__title">Iм’я/Name</span>
                    <span className="card-info__subtitle">
                      {string.inputName}
                    </span>
                  </div>
                  <div className="card-info__text__patronimyc">
                    <span className="card-info__title">
                      По батьковi/Patronimyc
                    </span>
                    <span className="card-info__subtitle">
                      {string.inputPatric}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="card">
            <div className="card-wrapper">
              <div className="card-header">
                <span className="card-country">{string.inputVodCountry}</span>
                <p>Водiйське подсвiдчення</p>
              </div>
              <div className="card-general">
                <div className="card-info__top">
                  <div className="card-info__img">
                    <img src={string.inputVodPhoto} alt="img" />
                  </div>
                  <div className="card-info__text">
                    <div className="card-info__text__birth">
                      <span className="card-info__title">Категорії:</span>
                      <span className="card-info__subtitle">
                        {string.inputVodCategory}
                      </span>
                    </div>
                    <div className="card-info__text__expiry">
                      <span className="card-info__title">Видано:</span>
                      <span className="card-info__subtitle">
                        {string.inputVodDown}
                      </span>
                    </div>
                    <div className="card-info__text__sex">
                      <span className="card-info__title">Номер:</span>
                      <span className="card-info__subtitle">
                        {string.inputVodNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-info__bottom">
                  <div className="card-info__text__surname">
                    <span className="card-info__title">Прiзвище/Surname</span>
                    <span className="card-info__subtitle">
                      {string.inputVodSurname}
                    </span>
                  </div>
                  <div className="card-info__text__name">
                    <span className="card-info__title">Iм’я/Name</span>
                    <span className="card-info__subtitle">
                      {string.inputVodName}
                    </span>
                  </div>
                  <div className="card-info__text__patronimyc">
                    <span className="card-info__title">
                      По батьковi/Patronimyc
                    </span>
                    <span className="card-info__subtitle">
                      {string.inputVodPatric}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default Card;
