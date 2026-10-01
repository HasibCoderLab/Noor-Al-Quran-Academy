export const toPublicBooking = (booking) => ({
  id: String(booking._id),
  type: booking.type,
  course: booking.course,
  date: booking.date || "",
  day: booking.day || "",
  time: booking.time || "",
  duration: booking.duration,
  status: booking.status,
  paymentStatus: booking.paymentStatus || "unpaid",
  planName: booking.planName || "",
  name: booking.name,
  email: booking.email,
  country: booking.country || "",
  whatsapp: booking.whatsapp,
  message: booking.message || "",
  createdAt: booking.createdAt,
});

export const toAdminBooking = (booking) => ({
  id: String(booking._id),
  user: booking.user
    ? {
        id: String(booking.user._id || booking.user),
        name: booking.user.name || "",
        email: booking.user.email || "",
      }
    : null,
  type: booking.type,
  course: booking.course,
  date: booking.date || "",
  day: booking.day || "",
  time: booking.time || "",
  duration: booking.duration,
  status: booking.status,
  paymentStatus: booking.paymentStatus || "unpaid",
  planName: booking.planName || "",
  orderId: booking.order ? String(booking.order._id || booking.order) : null,
  name: booking.name,
  email: booking.email,
  country: booking.country || "",
  whatsapp: booking.whatsapp,
  message: booking.message || "",
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});

export const toAdminAvailability = (slot) => ({
  id: String(slot._id),
  date: slot.date,
  day: slot.day,
  time: slot.time,
  duration: slot.duration,
  status: slot.status,
  notes: slot.notes || "",
  booking: slot.booking
    ? {
        id: String(slot.booking._id || slot.booking),
        name: slot.booking.name || "",
        email: slot.booking.email || "",
      }
    : null,
});

export const toPublicOrder = (order) => ({
  id: String(order._id),
  region: order.region,
  planName: order.planName,
  classes: order.classes,
  amount: order.amount,
  currency: order.currency,
  status: order.status,
  bookingId: order.booking ? String(order.booking._id || order.booking) : "",
  stripeSessionId: order.stripeSessionId || "",
  paidAt: order.paidAt,
  createdAt: order.createdAt,
});

export const toAdminOrder = (order) => ({
  ...toPublicOrder(order),
  email: order.email,
  user: order.user
    ? {
        id: String(order.user._id || order.user),
        name: order.user.name || "",
        email: order.user.email || "",
      }
    : null,
  updatedAt: order.updatedAt,
});

export const toPublicProgress = (doc) => ({
  id: String(doc._id),
  course: doc.course,
  status: doc.status,
  currentLesson: doc.currentLesson || "",
  lessonsCompleted: doc.lessonsCompleted,
  totalLessons: doc.totalLessons,
  lastAssessment: doc.lastAssessment || "",
  notes: doc.notes || "",
  updatedAt: doc.updatedAt,
});

export const toPublicReview = (review) => ({
  id: String(review._id),
  name: review.name,
  country: review.country || "",
  course: review.course,
  text: review.text,
  rating: review.rating,
  status: review.status,
  createdAt: review.createdAt,
});

export const toAdminReview = (review) => ({
  ...toPublicReview(review),
  user: review.user
    ? {
        id: String(review.user._id || review.user),
        name: review.user.name || "",
        email: review.user.email || "",
      }
    : null,
  updatedAt: review.updatedAt,
});
