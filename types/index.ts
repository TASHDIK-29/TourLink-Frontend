export type Role = "SUPER_ADMIN" | "ADMIN" | "USER" | "GUIDE";
export type IsActive = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  picture?: string;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
  role: Role;
  auths?: IAuthProvider[];
  bookings?: string[];
  createdAt?: string;
}

export interface ITourType {
  _id: string;
  /** The model stores `tourName`, but create/update validation expects `name`. */
  tourName?: string;
  name?: string;
  createdAt?: string;
}

export interface IDivision {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  description?: string;
}

export interface ITour {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  images?: string[];
  location?: string;
  costFrom?: number;
  startDate?: string;
  endDate?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  included?: string[];
  excluded?: string[];
  amenities?: string[];
  tourPlan?: string[];
  maxGuest?: number;
  minAge?: number;
  /** Tours are NOT populated by the backend — these come back as id strings. */
  division: string;
  tourType: string;
  createdAt?: string;
}

export type BookingStatus = "PENDING" | "CANCEL" | "COMPLETE" | "FAILED";

export type PaymentStatus =
  | "PAID"
  | "UNPAID"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

export interface IPayment {
  _id: string;
  booking: string;
  transactionId: string;
  amount: number;
  invoiceUrl?: string;
  status: PaymentStatus;
}

/**
 * Bookings ARE populated (unlike tours): the service attaches `tour` and
 * `payment` documents, and `user` too on the admin/detail routes.
 */
export interface IBooking {
  _id: string;
  user: string | IUser;
  tour: ITour | null;
  payment?: IPayment | null;
  guestCount: number;
  status: BookingStatus;
  createdAt: string;
}

/* ---- Stats -----------------------------------------------------------------
 * The stats aggregations return `_id` as the grouped-by VALUE (a role name, a
 * division name, a status), not an id. Several `$group: { _id: null }` results
 * arrive as a single-element array rather than a scalar — see `unwrapAgg`.
 */

/** `{ _id: <group value>, count: n }` — the shape every `$group … $sum` returns. */
export interface CountBucket {
  _id: string | null;
  count: number;
}

/** Top-tours buckets name their measure `bookingCount`, not `count`. */
export interface TourBookingBucket {
  _id: string;
  bookingCount: number;
  tour?: { title?: string; slug?: string };
}

export interface UserStats {
  totalUsers: number;
  totalActiveUsers: number;
  totalInActiveUsers: number;
  totalBlockedUsers: number;
  newUsersInLast7Days: number;
  newUsersInLast30Days: number;
  usersByRole: CountBucket[];
}

export interface TourStats {
  totalTour: number;
  totalTourByTourType: CountBucket[];
  /** `[{ _id: null, avgCostFrom }]` — an array, unlike booking's avg. */
  avgTourCost: { avgCostFrom: number }[];
  totalTourByDivision: CountBucket[];
  totalHighestBookedTour: TourBookingBucket[];
}

export interface BookingStats {
  totalBooking: number;
  totalBookingByStatus: CountBucket[];
  bookingsPerTour: TourBookingBucket[];
  /** Already unwrapped to a scalar by the service — inconsistent with the others. */
  avgGuestCountPerBooking: number;
  bookingsLast7Days: number;
  bookingsLast30Days: number;
  totalBookingByUniqueUsers: number;
}

export interface PaymentStats {
  totalPayment: number;
  totalPaymentByStatus: CountBucket[];
  totalRevenue: { totalRevenue: number }[];
  /** Note the backend's capitalisation typo: `avgPaymentAMount`. */
  avgPaymentAmount: { avgPaymentAMount: number }[];
  paymentGatewayData: CountBucket[];
}

/** Every controller responds through `sendResponse`, so the envelope is uniform. */
export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  data: T;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}
