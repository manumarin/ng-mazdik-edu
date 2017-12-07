import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {ITreeNode, ITreeService} from '../types/interfaces';
import {FilterState} from '../types/enums';
import {id} from '../utils/id';

@Component({
  selector: 'tree-view-node',
  styleUrls: ['./tree-view.component.css'],
  template: `
    <li *ngIf="node" [ngClass]="nodeClass()">
      <i [ngClass]="getIcon(node)"
         (click)="onExpand(node)">
      </i>
      <span [ngClass]="nodeContentClass()"
            (click)="onSelectNode(node)"
            (dblclick)="onExpand(node)">
        {{node.name}}
      </span>
      <ul class="tree-container" *ngIf="node.children && node.expanded">
        <tree-view-node
          *ngFor="let childNode of node.children"
          [node]="childNode"
          [service]="service"
          [selectedNode]="selectedNode"
          (selectedChanged)="onSelectNode($event)"
          (requestNodes)="onRequestLocal($event)">
        </tree-view-node>
      </ul>
    </li>
  `
})
export class TreeViewNodeComponent implements OnInit {

  @Input()
  set node(val: ITreeNode) {
    if (val && !val.$$id) {
      val.$$id = id();
    }
    this._node = val;
  }

  get node(): ITreeNode {
    return this._node;
  }

  @Input() public selectedNode: ITreeNode;
  @Input() public service: ITreeService;

  @Output() selectedChanged: EventEmitter<ITreeNode> = new EventEmitter<ITreeNode>();
  @Output() requestNodes: EventEmitter<any> = new EventEmitter();

  loading: boolean = false;
  private _node: ITreeNode;

  constructor() {
  }

  ngOnInit() {
  }

  isLeaf(node: ITreeNode) {
    return node.leaf === false ? false : !(node.children && node.children.length);
  }

  isSelected(node: ITreeNode) {
    return node === this.selectedNode;
  }

  onSelectNode(node: ITreeNode) {
    if (this.selectedNode !== node) {
      this.selectedNode = node;
      this.selectedChanged.emit(node);
    }
  }

  onExpand(node: ITreeNode) {
    node.expanded = !node.expanded;
    if (node.expanded) {
      this.loadNode(node);
    }
  }

  loadNode(node: ITreeNode) {
    if ((!node.children || node.children.length === 0) && node.leaf === false) {
      if (this.service) {
        this.loading = true;
        this.service.getNodes(node).then(data => {
          this.loading = false;
          this.requestNodes.emit({'parentId': node.$$id, 'children': data});
        }).catch(err => {
          this.loading = false;
        });
      }
    }
  }

  onRequestLocal(node: ITreeNode) {
    this.requestNodes.emit(node);
  }

  getIcon(node: ITreeNode): string {
    let icon: string;
    if (this.loading) {
      return 'icon-collapsing';
    }
    if (node.icon) {
      icon = node.icon;
    } else if (!this.isLeaf(node) && node.expanded) {
      icon = 'icon-node icon-collapsed';
    } else if (!this.isLeaf(node)) {
      icon = 'icon-node';
    }
    return icon;
  }

  nodeClass(): string {
    let cls: string = 'treenode';
    if (this.node.$$filterState === FilterState.NOT_FOUND) {
      cls += ' filter-not-found';
    }
    return cls;
  }

  nodeContentClass(): string {
    let cls: string = 'treenode-content';
    if (this.node.$$filterState === FilterState.FOUND) {
      cls += ' filter-found';
    } else if (this.node.$$filterState === FilterState.ON_FOUND_PATH) {
      cls += ' filter-on-path';
    }
    if (this.isSelected(this.node)) {
      cls += ' highlight';
    }
    return cls;
  }

}
