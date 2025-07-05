// UI 관련 타입 정의
export interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  key: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'select';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface ChartColors {
  primary: string[];
  success: string[];
  warning: string[];
  error: string[];
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
}

export interface ComponentSize {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

// React 컴포넌트 공통 Props
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface ClickableProps extends BaseComponentProps {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-checked'?: boolean;
  role?: string;
  tabIndex?: number;
}

// 컴포넌트별 특화된 Props
export interface ButtonProps extends ClickableProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  target?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends FormFieldProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  variant?: 'default' | 'error' | 'success' | 'focus';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  elevation?: number;
  hoverable?: boolean;
  clickable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  destroyOnClose?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  zIndex?: number;
}

export interface TooltipProps extends BaseComponentProps {
  content: React.ReactNode;
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-start'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'left-start'
    | 'left-end'
    | 'right-start'
    | 'right-end';
  trigger?: 'hover' | 'focus' | 'click' | 'manual';
  visible?: boolean;
  defaultVisible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  arrow?: boolean;
}

export interface TableProps<T = any> extends BaseComponentProps {
  dataSource: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: PaginationConfig | false;
  sortConfig?: SortConfig;
  onSort?: (sortConfig: SortConfig) => void;
  onRow?: (
    record: T,
    index: number
  ) => React.HTMLAttributes<HTMLTableRowElement>;
  rowKey?: keyof T | ((record: T) => string);
  expandable?: {
    expandedRowKeys?: string[];
    defaultExpandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
    onExpandedRowsChange?: (expandedRows: string[]) => void;
    expandedRowRender?: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  scroll?: { x?: number | string; y?: number | string };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bordered?: boolean;
  showHeader?: boolean;
  title?: () => React.ReactNode;
  footer?: () => React.ReactNode;
  emptyText?: React.ReactNode;
}

export interface FormProps extends BaseComponentProps {
  layout?: 'horizontal' | 'vertical' | 'inline';
  labelCol?: { span?: number; offset?: number };
  wrapperCol?: { span?: number; offset?: number };
  colon?: boolean;
  hideRequiredMark?: boolean;
  validateTrigger?: string | string[];
  onFinish?: (values: any) => void;
  onFinishFailed?: (errorInfo: any) => void;
  onFieldsChange?: (changedFields: any[], allFields: any[]) => void;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  initialValues?: any;
  preserve?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface PaginationProps extends BaseComponentProps {
  current?: number;
  defaultCurrent?: number;
  total: number;
  pageSize?: number;
  defaultPageSize?: number;
  pageSizeOptions?: string[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  simple?: boolean;
  hideOnSinglePage?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
  disabled?: boolean;
}

export interface SelectProps extends FormFieldProps {
  value?: string | string[] | number | number[];
  defaultValue?: string | string[] | number | number[];
  onChange?: (value: any, option: any) => void;
  onSelect?: (value: any, option: any) => void;
  onDeselect?: (value: any, option: any) => void;
  onSearch?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  onPopupScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  onDropdownVisibleChange?: (visible: boolean) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mode?: 'multiple' | 'tags';
  allowClear?: boolean;
  clearIcon?: React.ReactNode;
  placeholder?: string;
  notFoundContent?: React.ReactNode;
  showSearch?: boolean;
  showArrow?: boolean;
  filterOption?: boolean | ((inputValue: string, option: any) => boolean);
  filterSort?: (optionA: any, optionB: any) => number;
  optionFilterProp?: string;
  optionLabelProp?: string;
  maxTagCount?: number;
  maxTagTextLength?: number;
  maxTagPlaceholder?: React.ReactNode;
  tokenSeparators?: string[];
  open?: boolean;
  defaultOpen?: boolean;
  listHeight?: number;
  listItemHeight?: number;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  dropdownClassName?: string;
  dropdownStyle?: React.CSSProperties;
  dropdownMatchSelectWidth?: boolean | number;
  dropdownAlign?: any;
  options?: Array<{
    value: string | number;
    label: React.ReactNode;
    disabled?: boolean;
    [key: string]: any;
  }>;
  loading?: boolean;
  bordered?: boolean;
  autoFocus?: boolean;
  suffixIcon?: React.ReactNode;
  removeIcon?: React.ReactNode;
  menuItemSelectedIcon?: React.ReactNode;
  tagRender?: (props: any) => React.ReactNode;
  direction?: 'ltr' | 'rtl';
  virtual?: boolean;
  searchValue?: string;
  onClear?: () => void;
}
