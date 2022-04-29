import {
  FETCH_MESSAGES,
  FETCH_MESSAGES_SUCCESS,
  FETCH_MESSAGES_FAILED,
  SEND_MESSAGE,
  STOP_FETCH_MESSAGES,
  UPDATE_MESSAGES_TO_READ,
} from "../store/types";

const INITIAL_STATE = {
  messages: [],
  loading: false,
  error: {
    flag: false,
    msg: null,
  },
};

export const chatreducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case FETCH_MESSAGES:
      return {
        ...state,
        loading: true,
      };
    case FETCH_MESSAGES_SUCCESS:
      return {
        ...state,
        messages: action.payload,
        loading: false,
      };
    case FETCH_MESSAGES_FAILED:
      return {
        ...state,
        messages: null,
        loading: false,
        error: {
          flag: true,
          msg: action.payload,
        },
      };
    case SEND_MESSAGE:
      return state;
    case STOP_FETCH_MESSAGES:
      return INITIAL_STATE;

    case UPDATE_MESSAGES_TO_READ:
      return state;

    default:
      return state;
  }
};
