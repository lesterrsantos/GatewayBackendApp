const _ = require("lodash");
const validator = require("validator");

module.exports = (mongoose) => {
  var GatewaySchema = mongoose.Schema({
    serialNumber: {
      required: true,
      type: String,
      unique: true,
      trim: true,
    },
    humanReadableName: {
      type: String,
    },
    ipv4Address: {
      type: String,
      validate: {
        validator: validator.isIP,
        message: "{VALUE} is not a valid IP direction",
      },
    },
    peripheralDevices: [
      {
        uid: {
          type: Number,
        },
        vendor: {
          type: String,
        },
        dateCreated: {
          type: String,
        },
        status: {
          type: String,
          enum: ["online", "offline"],
          lowercase: true,
        },
      },
    ],
  });

  GatewaySchema.methods.toJSON = function () {
    var gateway = this;
    var gatewayObject = gateway.toObject();

    return _.pick(gatewayObject, [
      "_id",
      "serialNumber",
      "humanReadableName",
      "ipv4Address",
      "peripheralDevices",
    ]);
  };

  const Gateway = mongoose.model("gateway", GatewaySchema);
  return Gateway;
};
