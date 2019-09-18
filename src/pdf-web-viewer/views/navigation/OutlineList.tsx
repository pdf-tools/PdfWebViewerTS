import { h, Component } from 'hyperapp'
import { OutlineNavigationItem } from '../../state/navigationPanel'
import { PdfDestination } from '../../../pdf-viewer-api'
import { classNames } from '../../../common/classNames'
import { Icon, icons } from '../../../common/Icon'

/** @internal */
export interface OutlineListProps {
  items: OutlineNavigationItem[]
  path: string[]
  onToggleItem(path: string[]): void
  onOutlineItemSelected(target: PdfDestination): void
}

/** @internal */
export const OutlineList: Component<OutlineListProps> = ({ items, path, onToggleItem, onOutlineItemSelected }) => (
  <ul>
    {items.map(item => (
      <OutlineListItem
        item={item}
        path={path}
        onToggleItem={onToggleItem}
        onOutlineItemSelected={onOutlineItemSelected}
      />
    ))}
  </ul>
)

interface OutlineListItemProps {
  item: OutlineNavigationItem
  path: string[]
  onToggleItem(path: string[]): void
  onOutlineItemSelected(target: PdfDestination): void
}

const OutlineListItem: Component<OutlineListItemProps> = ({
  item,
  path,
  onToggleItem,
  onOutlineItemSelected,
}) => {
  const childPath = path.filter(c => true)
  childPath.push(item.id.toString())
  return (
    <li>
      <div>
        {(item.hasDescendants) ?
          <span
            class={classNames(
              {'pwv-outline-tree-btn-expand': !item.open},
              {'pwv-outline-tree-btn-collapse': item.open},
            )}
            onclick={() => { onToggleItem(childPath) }}
            >
            <Icon icon={item.open ? icons.outlineOpen : icons.outlineClosed} />
          </span> :
          <span class="pwv-outline-tree-indent"></span>
        }
        <span
          onclick={() => { onOutlineItemSelected(item.destination) }}
          class="pwv-outline-tree-lnk"
        >{item.title}</span>
      </div>
      {item.open && item.descendants &&
        <OutlineList
          items={item.descendants}
          path={childPath}
          onToggleItem={onToggleItem}
          onOutlineItemSelected={onOutlineItemSelected}
        />
      }
    </li>
  )
}
