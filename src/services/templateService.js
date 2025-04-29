// Template variable requirements
const templateRequirements = {
  userRegisteration: ["name", "verifyLink"],
};

const validateTemplateData = (templateName, templateData) => {
  const requiredVars = templateRequirements[templateName];
  if (!requiredVars) {
    throw new Error(`No requirements defined for template: ${templateName}`);
  }

  const missingVars = requiredVars.filter((varName) => !templateData[varName]);
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required template variables: ${missingVars.join(", ")}`
    );
  }

  return true;
};

module.exports = { validateTemplateData };
