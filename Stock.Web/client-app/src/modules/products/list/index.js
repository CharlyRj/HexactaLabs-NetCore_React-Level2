import { pickBy } from "lodash";
// import { normalize } from "../../../common/helpers/normalizer";
import api from "../../../common/api";
import { apiErrorToast } from "../../../common/api/apiErrorToast";

const initialState = {
  loading: false,
  products:[]
};

/* Action types */

const LOADING = "PRODUCT_LOADING";
const SET = "PRODUCT_SET";
const CREATE = "PRODUCT_CREATE";
const UPDATE = "PRODUCT_UPDATE";
const REMOVE = "PRODUCT_REMOVE";

export const ActionTypes = {
  LOADING,
  SET,
  CREATE,
  UPDATE,
  REMOVE
};

/* Reducer handlers */
function handleLoading(state, { loading }) {
  return {
    ...state,
    loading
  };
}

function handleSet(state, { products }) {
  return {
    ...state,
    products
  };
}

function handleNewProduct(state, { product }) {
  return {
    ...state,
    products: state.products.concat(product)
  };
}

function handleUpdateProduct(state, { product }) {
  return {
    ...state,
    products: state.products.map(p => (p.id === product.id ? product : p))
  };
}

function handleRemoveProduct(state, { id }) {
  return {
    ...state,
    products: state.products.filter(productId => productId !== id),
  };
}

const handlers = {
  [LOADING]: handleLoading,
  [SET]: handleSet,
  [CREATE]: handleNewProduct,
  [UPDATE]: handleUpdateProduct,
  [REMOVE]: handleRemoveProduct
};

export default function reducer(state = initialState, action) {
  const handler = handlers[action.type];
  return handler ? handler(state, action) : state;
}

/* Actions */
export function setLoading(status) {
  return {
    type: LOADING,
    loading: status
  };
}

export function setProducts(products) {
  return {
    type: SET,
    products
  };
}

export function getAll() {
  return dispatch => {
    dispatch(setLoading(true));
    return api
      .get("/product")
      .then(response => {
        dispatch(setProducts(response.data));
        return dispatch(setLoading(false));
      })
      .catch(error => {
        apiErrorToast(error);
        return dispatch(setLoading(false));
      });
      
  };
}

export function getById(id) {
  return getAll({ id });
}

export function fetchByFilters(filters) {
  return function(dispatch) {
    return api
      .post("/product/search", pickBy(filters))
      .then(response => {
        dispatch(setProducts(response.data));
      })
      .catch(error => {
        apiErrorToast(error);
      });
  };
}

/* Selectors */
function base(state) {
  return state.products.list;
}

export function getLoading(state) {
  return base(state).loading;
}

export function getProducts(state) {
  return base(state).products;
}

export function getProductById(state, id) {
  return getProducts(state).find(p => p.id === id);
}

function makeGetProductsMemoized() {
  let cache;
  let value = [];
  return state => {
    if (cache === getProductById(state)) {
      return value;
    }
    cache = getProductById(state);
    value = Object.values(getProductById(state));
    return value;
  };
}

export const getProduct = makeGetProductsMemoized();
