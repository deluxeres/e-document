const state = {
  inputName: "Им'я",
  inputSurname: "Прiзвище",
  inputPatric: "По батьковi",
  inputSex: "Чоловiк/Жiнка",
  inputBirth: "Дата народження",
  inputExpiry: "Дата завершення",
  inputPhoto: "https://i.ibb.co/F6yN0mL/depositphotos-51402215-stock-illustration-male-avatar-profile-picture-use.webp",
  inputCountry: "STATE"  
};

/**
 * Хранилище данных приложения
 * @param {Object} action
 * @param {string} action.type Тип события
 * @param {any} action.data Данные
 */


function store(action) {
  switch (action.type) {
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
      return { ...state };
    default:
      return { ...state };
  }
}

export { store };
