import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        weight: {
          type: Number,
          default: null,
          min: 0,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discount: {
          type: Number,
          default: 0,
          min: 0,
        },
        discountType: {
          type: String,
          enum: ["percentage", "fixed"],
          default: "percentage",
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    customerInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    billNumber: {
      type: String,
      unique: true,
    },
    supabaseUrl: {
      type: String,
      default: null,
    },
    loyaltyInfo: {
      applied: {
        type: Boolean,
        default: false,
      },
      discountAmount: {
        type: Number,
        default: 0,
      },
      discountPercentage: {
        type: Number,
        default: 0,
      },
      message: {
        type: String,
        default: "",
      },
      purchaseNumber: {
        type: Number,
        default: 0,
      },
    },
    hasCakeItems: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Generate bill number before saving
billSchema.pre("save", async function (next) {
  if (!this.billNumber) {
    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

      // Get start and end of today
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      );

      // Use atomic findOneAndUpdate to get unique sequence number
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const existingBills = await mongoose
          .model("Bill")
          .find({
            createdAt: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          })
          .sort({ createdAt: 1 });

        const sequenceNumber = existingBills.length + 1;
        const candidateBillNumber = `BILL-${dateStr}-${String(
          sequenceNumber
        ).padStart(4, "0")}`;

        // Check if this bill number already exists
        const existingBill = await mongoose.model("Bill").findOne({
          billNumber: candidateBillNumber,
        });

        if (!existingBill) {
          this.billNumber = candidateBillNumber;
          console.log("Generated bill number:", this.billNumber);
          break;
        }

        attempts++;

        // Add small random delay to avoid race conditions
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
      }

      if (!this.billNumber) {
        // Fallback: use timestamp-based unique identifier
        const timestamp = Date.now();
        this.billNumber = `BILL-${dateStr}-${timestamp.toString().slice(-6)}`;
        console.log("Generated fallback bill number:", this.billNumber);
      }
    } catch (error) {
      console.error("Error generating bill number:", error);
      return next(error);
    }
  }
  next();
});

export default mongoose.model("Bill", billSchema);
