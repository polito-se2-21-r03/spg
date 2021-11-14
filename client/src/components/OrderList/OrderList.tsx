// @ts-nocheck

import {
  Card, EmptyState, Filters, TextStyle, Badge,
  Pagination, IndexTable, useIndexResourceState, Select, TextField, Link
} from '@shopify/polaris';
import React, { useCallback, useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import dayjs from 'dayjs';

export function OrderList() {
  const history = useHistory();

  const [selectedItems, setSelectedItems] = useState([]);
  const [taggedWith, setTaggedWith] = useState(null);
  const [queryValue, setQueryValue] = useState(null);
  const [sortValue, setSortValue] = useState('DATE_CREATED_DESC');
  const [items, setItems] = useState([]);
  const [frontItems, setFrontItems] = useState([]);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [isLastPage, setIsLastPage] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    [],
  );
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(null), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(null), []);
  const handleClearAll = useCallback(() => {
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [handleQueryValueRemove, handleTaggedWithRemove]);

  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const customersMap = new Map();
  customersMap.set(1, 'Francesco');
  customersMap.set(2, 'Alessandro');

  /**
   * Data fetching
   */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await fetch(((process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : '/api') + '/order', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
        })
        const response = await data.json();

        if (response) {
          setItems(response.sort((a, b) => dayjs(b.creationDate).isAfter(a.creationDate) ? 1 : -1));
          setFrontItems(response.sort((a, b) => dayjs(b.creationDate).isAfter(a.creationDate) ? 1 : -1));
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [])

  /**
   * Filters
   */
  function disambiguateLabel(key, value) {
    switch (key) {
      case 'taggedWith':
        return `Tagged with ${value}`;
      default:
        return value;
    }
  }

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return value === '' || value == null;
    }
  }

  const filters = [];

  const appliedFilters = !isEmpty(taggedWith)
    ? [
      {
        key: 'taggedWith',
        label: disambiguateLabel('taggedWith', taggedWith),
        onRemove: handleTaggedWithRemove,
      },
    ]
    : [];

  // Filtering
  useEffect(() => {
    const filterItems = () => {
      const filteredItems = items.filter(item => {
        return item.name.toLowerCase().includes(queryValue ? queryValue.toLowerCase() : '');
      })
      setFrontItems(filteredItems);
    }
    filterItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryValue])

  /**
   * Handle sort
   */
  useEffect(() => {
    if (sortValue === 'DATE_CREATED_DESC') {
      const tmp = [...items];
      // @ts-ignore
      tmp.sort((a, b) => dayjs(b.creationDate).isAfter(a.creationDate) ? 1 : -1);
      setFrontItems(tmp);
    } else if (sortValue === 'DATE_CREATED_ASC') {
      const tmp = [...items];
      // @ts-ignore
      tmp.sort((a, b) => dayjs(b.creationDate).isAfter(a.creationDate) ? -1 : 1);
      setFrontItems(tmp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortValue]);

  /**
   * Row markup
   */
  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(frontItems);

  const rowMarkup = frontItems.map(
    (item, index) => (
      <IndexTable.Row
        id={item.orderId}
        key={item.orderId}
        selected={selectedResources.includes(item.orderId)}
        position={index}
      >
        <IndexTable.Cell>
          <TextStyle variation="strong">
            <Link url={`/orders/${item.orderId}`} removeUnderline monochrome passHref>
              <a
                style={{ color: 'inherit', textDecoration: 'none' }}
                data-primary-link>#{item.orderId}</a>
            </Link>
          </TextStyle>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {dayjs(item.creationDate).format('DD MMM HH:mm')}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {customersMap.get(item.clientId)}
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  /**
   * Empty state markup
   */
  let orderListMarkup = (
    <Card>
      <Card.Section>
        <EmptyState
          heading="Manage orders"
          image="https://cdn.shopify.com/shopifycloud/web/assets/v1/e7b58a8b2e612fe6cf6f8c9e53830b70.svg"
        >
          <p>
            Here you can manage your orders
          </p>
        </EmptyState>
      </Card.Section>
    </Card>
  );

  /**
   * Pagination markup
   */
  const paginationMarkup = items.length > 50
    ? (
      <div className={styles.CustomerListFooter}>
        <Pagination
          hasPrevious={!isFirstPage}
          hasNext={!isLastPage}
        // onPrevious={this.handlePreviousPage}
        // onNext={this.handleNextPage}
        />
      </div>
    )
    : null;

  /**
   * Markup with items
   */
  if (items.length > 0) {
    orderListMarkup = (
      <Card>
        <div style={{ padding: '16px', display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <Filters
              queryValue={queryValue}
              filters={filters}
              appliedFilters={appliedFilters}
              queryPlaceholder={'Filter customers'}
              onQueryChange={setQueryValue}
              onQueryClear={handleQueryValueRemove}
              onClearAll={handleClearAll}
            />
          </div>
          <div style={{ paddingLeft: '0.4rem' }}>
            <Select
              labelInline
              label="Ordina per"
              options={[
                { label: 'Order added date (from the most recent)', value: 'DATE_CREATED_DESC' },
                { label: 'Order added date (from the least recent)', value: 'DATE_CREATED_ASC' },
              ]}
              value={sortValue}
              onChange={(selected) => {
                setSortValue(selected);
              }}
            />
          </div>
        </div>
        <IndexTable
          resourceName={resourceName}
          itemCount={frontItems.length}
          selectedItemsCount={
            allResourcesSelected ? 'All' : selectedResources.length
          }
          hasMoreItems
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: 'Order' },
            { title: 'Date' },
            { title: 'Customer' },
          ]}
          sort
        >
          {rowMarkup}
        </IndexTable>
        {paginationMarkup}
      </Card>
    )
  }

  return orderListMarkup;
}