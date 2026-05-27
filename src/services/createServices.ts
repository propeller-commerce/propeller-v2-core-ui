import {
  GraphQLClient,
  ProductService,
  CartService,
  UserService,
  CategoryService,
  OrderService,
  PayMethodService,
  LoginService,
  AddressService,
  CompanyService,
  CrossupsellService,
  BundleService,
  FavoriteListService,
  PurchaseAuthorizationConfigService,
  ClusterService,
  OrderlistService,
} from 'propeller-sdk-v2';

/**
 * The single SDK seam for the whole package suite.
 *
 * Pre-extraction every composable / component did `new XxxService(graphqlClient)`
 * inline (48+ sites), each re-importing a module-level client. That coupled
 * 55 files directly to the SDK with zero reuse AND baked in a hardcoded
 * URL / env-var convention.
 *
 * This module is transport-agnostic:
 *  - The consumer constructs the `GraphQLClient` (with its own endpoint,
 *    headers, timeout, auth resolver).
 *  - The consumer calls `createServices(client)` to build a `Services`
 *    bundle keyed to that client.
 *  - The consumer hands both into the framework provider.
 *  - Composables/hooks read `services` and never touch the SDK constructor.
 *
 * Memoization (per client via WeakMap) is safe: `GraphQLClient` mutates
 * its own config in place via `updateConfig` and reads `this.config.headers`
 * at request time, so a cached service instance still picks up auth header
 * changes after login/logout. Per-client keying means multi-tenant /
 * alternative clients each get their own set.
 */
export interface Services {
  product: ProductService;
  cart: CartService;
  user: UserService;
  category: CategoryService;
  order: OrderService;
  payMethod: PayMethodService;
  login: LoginService;
  address: AddressService;
  company: CompanyService;
  crossupsell: CrossupsellService;
  bundle: BundleService;
  favoriteList: FavoriteListService;
  purchaseAuthConfig: PurchaseAuthorizationConfigService;
  cluster: ClusterService;
  orderlist: OrderlistService;
}

const servicesByClient = new WeakMap<GraphQLClient, Services>();

/**
 * Build (or retrieve cached) `Services` for a given `GraphQLClient`.
 *
 * Consumers call this once at app startup, alongside `new GraphQLClient(...)`,
 * and pass the result into the framework provider.
 */
export function createServices(client: GraphQLClient): Services {
  const cached = servicesByClient.get(client);
  if (cached) return cached;

  const services: Services = {
    product: new ProductService(client),
    cart: new CartService(client),
    user: new UserService(client),
    category: new CategoryService(client),
    order: new OrderService(client),
    payMethod: new PayMethodService(client),
    login: new LoginService(client),
    address: new AddressService(client),
    company: new CompanyService(client),
    crossupsell: new CrossupsellService(client),
    bundle: new BundleService(client),
    favoriteList: new FavoriteListService(client),
    purchaseAuthConfig: new PurchaseAuthorizationConfigService(client),
    cluster: new ClusterService(client),
    orderlist: new OrderlistService(client),
  };
  servicesByClient.set(client, services);
  return services;
}
