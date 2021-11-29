import fs from 'fs';
const PDFDocument = require('pdfkit-table');

// FONTS

// Courier, Courier - Bold, Courier - Oblique, Courier - BoldOblique;
// Helvetica, Helvetica - Bold, Helvetica - Oblique, Helvetica - BoldOblique;
// Times - Roman, Times - Bold, Times - Italic, Times - BoldItalic;
// Symbol;
// ZapfDingbats;

// LETTER (612.00 X 792.00) POINTS

export default async function DownloadPDF(req, res) {
  const doc = new PDFDocument({
    font: 'Helvetica',
    size: 'LETTER',
    layout: 'landscape',
    margins: {
      top: 30,
      bottom: 30,
      left: 30,
      right: 30,
    },
  });

  const ids = req.query.ids ? req.query.ids.split(',') : [];

  doc.pipe(fs.createWriteStream('/currencies.pdf'));
  doc.pipe(res);

  doc.fontSize(9);
  doc.text('Page 1', 0.9 * (doc.page.width - 50), doc.page.height - 50, {
    width: 100,
    align: 'right',
    lineBreak: false,
  });

  doc.image(
    process.env.NODE_ENV !== 'production'
      ? './public/corpay.jpg'
      : '/corpay.jpg',
    30,
    30
  );

  doc.fontSize(20);
  doc.text('Your Currency Selection', 400, 30, {
    align: 'right',
  });
  doc.fontSize(12);
  doc.text(
    'Below is the list generated from your online selection. Thank you for using our currency tool!',
    200,
    60,
    {
      align: 'right',
    }
  );

  doc.text('', 30, 100, { align: 'left' });

  const table = {
    addPage: true,
    headers: [
      {
        label: 'Country',
        align: 'center',
        property: 'country',
        width: 40,
        renderer: null,
      },
      {
        label: 'Currency',
        align: 'center',
        property: 'currency',
        width: 60,
        renderer: null,
      },
      {
        label: 'Code',
        align: 'center',
        property: 'code',
        width: 40,
        renderer: null,
      },
      {
        label: 'Wire',
        align: 'center',
        property: 'wire',
        width: 40,
        renderer: null,
      },
      {
        label: 'IACH',
        align: 'center',
        property: 'iach',
        width: 40,
        renderer: null,
      },
      {
        label: 'Draft',
        align: 'center',
        property: 'draft',
        width: 40,
        renderer: null,
      },
      {
        label: 'Electronic',
        align: 'center',
        property: 'electronic',
        width: 50,
        renderer: null,
      },
      {
        label: 'Cash Letters and Collections',
        align: 'center',
        property: 'cash_letters',
        width: 80,
        renderer: null,
      },
      {
        label: 'Link Balance',
        align: 'center',
        property: 'link_balance',
        width: 60,
        renderer: null,
      },
      {
        label: 'Forwards (Buyer Side)',
        align: 'center',
        property: 'buyer_side',
        width: 60,
        renderer: null,
      },
      {
        label: 'Forwards (Seller Side)',
        align: 'center',
        property: 'seller_side',
        width: 60,
        renderer: null,
      },
      {
        label: 'Non-Deliverable Forward',
        align: 'center',
        property: 'forward_ndf',
        width: 60,
        renderer: null,
      },
      {
        label: 'Options',
        align: 'center',
        property: 'options',
        width: 60,
        renderer: null,
      },
      {
        label: 'Non-Deliverable Options',
        align: 'center',
        property: 'option_ndf',
        width: 60,
        renderer: null,
      },
    ],
    datas: [],
  };

  const currencies = [];

  let pageNumber = 1;
  doc.on('pageAdded', () => {
    pageNumber++;

    // TODO HEADER
    doc.fontSize(20);
    doc.text('Your Currency Selection', 400, 30, {
      align: 'right',
    });
    doc.fontSize(12);
    doc.text(
      'Below is the list generated from your online selection. Thank you for using our currency tool!',
      200,
      60,
      {
        align: 'right',
      }
    );

    doc.fontSize(9);
    doc.text('', 30, 100, { align: 'left' });
    console.log('pageAdded: ', doc.x, doc.y);
    doc.x = 30;
    doc.y = 100;

    // FOOTER
    doc.text(
      'Page ' + pageNumber,
      0.9 * (doc.page.width - 50),
      doc.page.height - 50,
      {
        width: 100,
        align: 'right',
        lineBreak: false,
      }
    );
  });

  currencies.map((item, i) => {
    // 'Wire',
    //   'IACH',
    //   'Draft',
    //   'Electronic',
    //   'Cash Letters\nand Collections',
    //   'Link Balance',
    //   'Forwards\n(Buyer Side)',
    //   'Forwards\n(Seller Side)',
    //   'Non-Deliverable\nForward',
    //   'Options',
    //   'Non-Deliverable\nOptions';

    if (!ids.includes(item._id)) return;

    const checkList = {
      wire: 'No',
      iach: 'No',
      draft: 'No',
      electronic: 'No',
      cash_letters: 'No',
      link_balance: 'No',
      buyer_side: 'No',
      seller_side: 'No',
      forward_ndf: 'No',
      options: 'No',
      option_ndf: 'No',
    };

    item.bullets.map((bullet) => {
      if (
        bullet.name === 'wire_payments'
        // ||
        // bullet.name === 'wire_receivables'
      ) {
        checkList.wire = 'Yes';
      } else if (bullet.name === 'iach') {
        if (bullet.value === 'IACH Payment') checkList.iach = 'Yes';
        else checkList.iach = bullet.value;
      } else if (bullet.name === 'cashletter' || bullet.name === 'collection') {
        checkList.cash_letters = 'Yes';
      } else {
        checkList[bullet.name] = 'Yes';
      }
    });

    var currency = {
      country: item.country,
      currency: item.currency,
      code: item.code,
      ...checkList,
    };
    table.datas.push(currency);
  });

  doc.table(table, {
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font('Helvetica').fontSize(9);
      // if (indexRow % 2 !== 0) doc.addBackground(rectRow, 'lightgray');
      // else {
      // doc.addBackground(rectRow, 'red', 0.15);
      // }
    },
  });

  doc.end();
}
