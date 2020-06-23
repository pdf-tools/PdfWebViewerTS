# PdfWebViewer

In this repository is the complete GUI code for the PDF Tools PDF Web Viewer.
This is the place to start if you need to change more than the options allow.

If you have any questions regarding code structure do not hesitate to contact us at pdfsupport@pdf-tools.com

[Online Demo](https://www.pdf-tools.com/pdf20/en/products/pdf-rendering/pdf-web-viewer/online-demo/)

## Development

### Prerequisites

- [Git](https://git-scm.com/download/win)
- [Nodejs](https://nodejs.org/)
- Text Editor [Visual Studio Code](https://code.visualstudio.com/) (recommended)
- Register an account on [our homepage](https://www.pdf-tools.com/pdf20/en/products/pdf-rendering/pdf-web-viewer/) and get a 30-days free trial for the [3-Heights™ PDF Web Viewer](https://www.pdf-tools.com/pdf20/en/products/pdf-rendering/pdf-web-viewer/)
- Download the viewer binaries from the [licenses and kits](https://www.pdf-tools.com/pdf20/en/mypdftools/licenses-kits/) site and copy the `pdfwebviewer` folder from within `webapp` into the `static` folder.

### Install locally
```
> git clone https://github.com/pdf-tools/PdfWebViewerTS.git
> cd PdfWebViewerTS
> mkdir static
> npm install
```

- From the kit downloaded from our website, copy the `pdfwebviewer` folder from inside `webapp` into the `static` folder.

Add the license key to the sample files `src/examples/pdf-web-viewer/index.ts` or `src/examples/pdf-web-viewer/with-options.html`.

### run local dev server
```
> npm run dev
```
