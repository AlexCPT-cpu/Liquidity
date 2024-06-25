function generateHTML(dataArray, header) {
  // Function to generate HTML content with a bold heading and bulleted points

  let htmlContent = `<b>${header}:</b>\n\n`;

  // Add each item as a bulleted point
  dataArray.forEach((item) => {
    htmlContent += `• username: @${item?.username}\n\u00A0\u00A0\u00A0price: $${item.price}\n\n`;
  });

  htmlContent += `<i>enter the username of the freelancer you wish to contract starting with @</i>`;

  return htmlContent;
}

export default generateHTML;
