const state = {
  inputFlag: "UA |",
  inputName: "Не задано",
  inputSurname: "Не задано",
  inputPatric: "Не задано",
  inputSex: "Не задано",
  inputBirth: "Не задано",
  inputExpiry: "Не задано",
  inputPhoto: "https://image.jimcdn.com/app/cms/image/transf/none/path/sf54a6dcd61ce200c/image/i356ee186367af551/version/1637349326/image.jpg",
  inputCountry: "Ukraine",
  inputVodName: "Не задано",
  inputVodSurname: "Не задано",
  inputVodPatric: "Не задано", 
  inputVodCategory: "Не задано", 
  inputVodDown: "Не задано",
  inputVodNumber: "Не задано",
  inputVodPhoto: "https://avatars.mds.yandex.net/get-altay/2056672/2a0000016bfdf77e48670fc388fa3716096c/XXL",
  inputVodCountry: "Ukraine",
};

/**
 * Хранилище данных приложения
 * @param {Object} action
 * @param {string} action.type Тип события
 * @param {any} action.data Данные
 */


function store(action) {
  switch (action.type) {
    case "changeInputFlag":
      state.inputFlag = action.data;
      return { ...state };
    case "changeInputName":
      state.inputName = action.data;
      return { ...state };
    case "changeInputSurname":
      state.inputSurname = action.data;
      return { ...state };
    case "changeInputPatric":
      state.inputPatric = action.data;
      return { ...state };
    case "changeInputSex":
      state.inputSex = action.data;
      return { ...state };
    case "changeInputBirth":
      state.inputBirth = action.data;
      return { ...state };
    case "changeInputExpiry":
      state.inputExpiry = action.data;
      return { ...state };
    case "changeInputPhoto":
      state.inputPhoto = action.data;
      return { ...state };
    case "changeInputCountry":
      state.inputCountry = action.data;
      // водительское
      return { ...state };
    case "changeInputVodName":
      state.inputVodName = action.data;
      return { ...state };
    case "changeInputVodSurname":
      state.inputVodSurname = action.data;
        return { ...state };
    case "changeInputVodPatric":
      state.inputVodPatric = action.data;
        return { ...state };
    case "changeInputVodCategory":
        state.inputVodCategory = action.data;
        return { ...state };
    case "changeInputVodDown":
        state.inputVodDown = action.data;
        return { ...state };
    case "changeInputVodNumber":
        state.inputVodNumber = action.data;
        return { ...state };
    case "changeInputVodPhoto":
        state.inputVodPhoto = action.data;
        return { ...state };
    case "changeInputVodCountry":
        state.inputVodCountry = action.data;
        return { ...state };
    default:
      return { ...state };
  }
}

export { store };
