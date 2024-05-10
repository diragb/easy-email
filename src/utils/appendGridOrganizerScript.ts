// Constants:
const SCRIPT = `
const getElementsPerMajor = ({ threshold, elementCount }) => {
  const columnsRequired = Math.ceil(elementCount / threshold)
  const maxElementsPerWrappedColumn = Math.ceil(elementCount / columnsRequired)

  const elementsPerColumn = []
  let remainingElements = elementCount
  if (maxElementsPerWrappedColumn < threshold) {
    for (let i = 0; i < columnsRequired; i++) {
      if (remainingElements > maxElementsPerWrappedColumn) {
        elementsPerColumn.push(maxElementsPerWrappedColumn)
      } else {
        elementsPerColumn.push(remainingElements)
      }
      remainingElements = remainingElements - maxElementsPerWrappedColumn
    }
  } else {
    for (let i = 0; i < columnsRequired; i++) {
      if (remainingElements >= threshold) {
        remainingElements = remainingElements - threshold
        elementsPerColumn.push(threshold)
      } else {
        elementsPerColumn.push(remainingElements)
      }
    }
  }

  return elementsPerColumn
}

const createRow = (gridElement, internalHTML) => {
  const gridSectionParents = gridElement.querySelectorAll(
    '[data-type="grid-section-parent"]'
  )
  if (!gridSectionParents) return
  const gridSectionParent = gridSectionParents[0]
  if (!gridSectionParent) return

  const columnHTMLString = \`
    <div style="margin:0px auto;max-width:1200px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
        <tbody>
          <tr>
            \${internalHTML}
          </tr>
        </tbody>
      </table>
    </div>
  \`
  gridSectionParent.innerHTML =
    gridSectionParent.innerHTML +
    \`

    \` +
    columnHTMLString
}

const organizeGridElement = gridElement => {
  const gridRepeatableElementsParent = document.evaluate(
    "//table/tbody/tr/td/div[1]/table/tbody/tr",
    gridElement,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
  if (!gridRepeatableElementsParent) return

  const elements = [...gridRepeatableElementsParent.children]

  const threshold = parseInt(gridElement.attributes["data-threshold"].value)
  const direction = gridElement.attributes["data-direction"].value

  const elementsPerMajor = getElementsPerMajor({
    threshold,
    elementCount: elements.length
  })
  const majorCount = elementsPerMajor.length

  // Remove all columns
  const gridSections = gridElement.querySelectorAll(
    '[data-type="grid-section"]'
  )
  if (!gridSections) return
  const gridColumnsParent = gridSections[0]?.parentElement
  if (!gridColumnsParent) return
  gridColumnsParent.setAttribute("data-type", "grid-section-parent")
  gridColumnsParent.innerHTML = ""

  if (direction === "row") {
    let filledElementsIndex = 0
    for (let columnCount = 0; columnCount < majorCount; columnCount++) {
      const maxElementsPerRow = Math.max(...elementsPerMajor)
      const elementsInThisColumn = elementsPerMajor[columnCount]
      const startIndex = filledElementsIndex
      const endIndex = filledElementsIndex + elementsInThisColumn

      const relevantElements = elements.slice(startIndex, endIndex)
      let relevantElementsHTML = relevantElements.reduce((acc, cur) => {
        const wrappedInnerHTML = \`
          <td style="border:none;direction:ltr;font-size:0px;padding:20px 0px 20px 0px;text-align:center;">
            \${cur.innerHTML}
          </td>
        \`
        return acc + wrappedInnerHTML
      }, "")

      filledElementsIndex = elementsInThisColumn

      if (elementsInThisColumn < maxElementsPerRow) {
        for (let i = 0; i < maxElementsPerRow - elementsInThisColumn; i++) {
          relevantElementsHTML =
            relevantElementsHTML +
            \`<td style="border:none; direction:ltr; font-size:0px; padding:20px 0px 20px 0px; text-align:center; width: \${100 /
              threshold}%"></td>\`
        }
      }

      createRow(gridElement, relevantElementsHTML)
    }
  } else if (direction === "column") {
    const maxColumns = majorCount
    const maxRows = Math.max(...elementsPerMajor)
    const elementsRCGrid = Array(maxRows)
      .fill(null)
      .map(_ => [])

    // Defining x: x is r(c(e)) i.e. e[0][0], e[0][1], e[0][2], etc.
    // Defining y: y is c(r(e)) i.e. e[0][0], e[1][0], e[2][0], etc.
    // Push with y, pop with x.

    // Pushing with y.
    let elementIterator = 0
    for (let c = 0; c < maxColumns; c++) {
      for (let r = 0; r < maxRows; r++) {
        const doesElementExist =
          typeof elements[elementIterator] !== "undefined"
        const elementInnerHTML = \`
          <td style="border:none; direction:ltr; font-size:0px; padding:20px 0px 20px 0px; text-align:center; width: \${100 /
            maxColumns}%">
            \${doesElementExist ? elements[elementIterator]?.innerHTML : ""}
          </td>
        \`
        elementsRCGrid[r][c] = elementInnerHTML
        elementIterator++
      }
    }

    // Popping with x.
    const gridSectionParents = gridElement.querySelectorAll(
      '[data-type="grid-section-parent"]'
    )
    if (!gridSectionParents) return
    const parentToColumns = gridSectionParents[0]
    if (!parentToColumns) return
    parentToColumns.innerHTML = ""

    for (let r = 0; r < maxRows; r++) {
      let elementsInRow = []
      for (let c = 0; c < threshold + 1; c++) {
        elementsInRow.push(elementsRCGrid[r][c])
      }
      const elementsInRowHTML = elementsInRow.join("")

      createRow(gridElement, elementsInRowHTML)
      elementsInRow = []
    }
  }
}

const organizeGridElements = () => {
  const gridElements = document.querySelectorAll('[data-type="grid"]')
  if (!gridElements) return

  gridElements.forEach(gridElement => organizeGridElement(gridElement))
}

window.organizeGridElements = organizeGridElements

window.onload = () => organizeGridElements()
`;

// Functions:
const appendGridOrganizerScript = (html: string) => {
  if (!html.includes('data-type="grid"')) return html;

  const container = document.createElement('div');
  container.id = 'append-js';
  container.style.position = 'absolute';
  container.style.left = '-9999px';

  container.innerHTML = html;
  document.body.appendChild(container);
  const xbody = container.getElementsByTagName('x-body');
  const script = document.createElement('script');
  script.textContent = SCRIPT;
  xbody[0]?.appendChild(script);

  const finalHTML = container.innerHTML;

  document.body.removeChild(container);
  return finalHTML;
};

// Exports:
export default appendGridOrganizerScript;
