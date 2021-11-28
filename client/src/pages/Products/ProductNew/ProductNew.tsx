import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Autocomplete,
  Button,
  Card,
  ContextualSaveBar,
  DatePicker,
  FormLayout,
  Frame,
  Icon,
  Layout,
  Loading,
  Page,
  Select,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  TextContainer,
  TextField,
  Toast,
  Banner
} from '@shopify/polaris';

import { TopBarMarkup, NavigationMarkup, contextControlMarkup } from '../../../components';

import './ProductNew.scss';
import { SearchMinor } from '@shopify/polaris-icons';
import { useHistory } from 'react-router';

export function ProductNew({ user, location }: any) {
  const history = useHistory();

  const skipToContentRef = useRef<HTMLAnchorElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);
  const [isDirty, setIsDirty] = useState(true);
  const [active, setActive] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const [saveError, setSaveError] = useState(false);

  const toggleMobileNavigationActive = useCallback(
    () =>
      setMobileNavigationActive(
        (mobileNavigationActive) => !mobileNavigationActive,
      ),
    [],
  );

  const handleMobileNavigation = (data: any) => {
    setMobileNavigationActive(
      (data) => !data,
    )
  }

  /**
   * Product States
   */
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [type, setType] = useState('');
  const [url, setUrl] = useState('');

  /**
   * Search farmers
   */
  const [farmer, setFarmer] = useState(-1);
  const [selectedFarmerOptions, setSelectedFarmerOptions] = useState([]);
  const [inputFarmerValue, setInputFarmerValue] = useState('');
  const deselectedFarmerOptions = [
    { value: '1', label: 'Francesco' },
    { value: '2', label: 'Alessandro' },
  ]
  const [farmerOptions, setFarmerOptions] = useState(deselectedFarmerOptions);

  const handleDiscard = useCallback(() => {
    setIsDirty(false);
  }, []);

  /**
   * Save data
   */
  const handleSave = useCallback(async () => {
    try {
      const data = await fetch(((process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : '/api') + '/product', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          producerId: farmer,
          quantity: Number(quantity),
          price: Number(price),
          name: name,
          type: type,
        })
      })
      const response = await data.json();

      if (response) {
        setActive(true);
        setTimeout(() => {
          history.push(`/products/${response.productId}`);
        }, 3000);
        setIsDirty(false);
      } else {
        setSaveError(true);
      }
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmer, quantity, price, name, type]);

  /**
   * Product Handlers
   */
  const handleNameChange = useCallback((e) => {
    setName(e);
  }, []);
  const handlePriceChange = useCallback((e) => {
    setPrice(e);
  }, []);
  const handleQuantityChange = useCallback((e) => {
    setQuantity(e);
  }, []);
  const handleTypeChange = useCallback((e) => {
    setType(e);
  }, []);


  const contextualSaveBarMarkup = isDirty ? (
    <ContextualSaveBar
      message={"Modifiche non salvate"}
      saveAction={{
        onAction: handleSave,
      }}
      discardAction={{
        onAction: handleDiscard,
        discardConfirmationModal: true,
      }}
      contextControl={contextControlMarkup}
    />
  ) : null;

  const loadingMarkup = isLoading ? <Loading /> : null;


  /**
   * Fetch data
   * - Fetch customers
   * - Fetch Companies
   */
  useEffect(() => {
    // const fetchClients = async () => {
    //   try {
    //     setIsLoading(true);
    //     const data = await fetch(((process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : '/api') + '/customers', {
    //       method: 'GET',
    //       credentials: 'include',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //     })
    //     const response = await data.json();

    //     if (response.status === 'success') {
    //       let tmp = [];
    //       for (const item of response.data) {
    //         tmp.push({ value: item._id, label: item.name });
    //       }
    //       // @ts-ignore
    //       setDeselectedOptions(tmp);
    //       // @ts-ignore
    //       setOptions(tmp);
    //       setIsLoading(false);
    //     } else {
    //       setIsLoading(false);
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    // fetchClients();
  }, [user.id])

  /**
   * Autocomplete Controls
   */

  /** Farmer */
  const updateFarmerText = useCallback(
    (value) => {
      setInputFarmerValue(value);

      if (value === '') {
        setFarmerOptions(deselectedFarmerOptions);
        return;
      }

      const filterRegex = new RegExp(value, 'i');
      const resultOptions = deselectedFarmerOptions.filter((option) => {
        // @ts-ignore
        return option.label.match(filterRegex)
      });
      setFarmerOptions(resultOptions);
    },
    [deselectedFarmerOptions]
  );

  const updateFarmerSelection = useCallback(
    (selected) => {
      const selectedValue = selected.map((selectedItem: any) => {
        const matchedOption = farmerOptions.find((option) => {
          // @ts-ignore
          return option.value.match(selectedItem);
        });
        // @ts-ignore
        return matchedOption;
      });
      setSelectedFarmerOptions(selected);
      setInputFarmerValue(selectedValue[0].label);
      setFarmer(Number(selectedValue[0].value));
    },
    [farmerOptions],
  );

  const farmerTextField = (
    <Autocomplete.TextField
      onChange={updateFarmerText}
      label="Farmer"
      value={inputFarmerValue}
      prefix={<Icon source={SearchMinor} color="base" />}
      placeholder="Search"
    />
  );

  /**
   * Error markups & toast
   */
  const toastMarkup = active ? (
    <Toast content="La polizza è stata creata con successo." onDismiss={toggleActive} />
  ) : null;

  const saveErrorMarkup = saveError && (
    <Layout.Section>
      <Banner
        title="Si è verificato un errore nel salvataggio dei dati"
        status="critical"
        onDismiss={() => setSaveError(false)}
      >
        <p>Si è pregati di riprovare più tardi.</p>
      </Banner>
    </Layout.Section>
  )

  // ---- Page markup ----
  const actualPageMarkup = (
    <Page
      title='Products'
      breadcrumbs={[{ content: 'Products', url: '/products' }]}
    >
      <Layout>
        {/* Banner */}
        {saveErrorMarkup}

        {/* Left section */}
        <Layout.Section>
          <Card sectioned>
            <FormLayout>
              <FormLayout.Group>
                <TextField type="text" label="Title" value={name} onChange={handleNameChange} />
              </FormLayout.Group>
            </FormLayout>
          </Card>
          <Card title="Inventory" sectioned>
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="Price"
                  value={price}
                  suffix="USD"
                  onChange={handlePriceChange}
                />
                <TextField
                  type="number"
                  label="Available"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </FormLayout.Group>
            </FormLayout>
          </Card>
        </Layout.Section>

        {/* Right section */}
        <Layout.Section secondary>
          <Card title="Organization" sectioned>
            <FormLayout>
              <FormLayout.Group>
                <TextField
                  type="text"
                  label="Category"
                  value={type}
                  onChange={handleTypeChange}
                />
                <Autocomplete
                  options={farmerOptions}
                  selected={selectedFarmerOptions}
                  onSelect={updateFarmerSelection}
                  textField={farmerTextField}
                />
              </FormLayout.Group>
            </FormLayout>
          </Card>
        </Layout.Section>

      </Layout>
    </Page>
  );

  // ---- Loading ----
  const loadingPageMarkup = (
    <SkeletonPage>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <TextContainer>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={9} />
            </TextContainer>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );

  const pageMarkup = isLoading ? loadingPageMarkup : actualPageMarkup;

  return (
    <Frame
      topBar={
        <TopBarMarkup handleMobileNavigation={handleMobileNavigation} />
      }
      navigation={<NavigationMarkup user={user} />}
      showMobileNavigation={mobileNavigationActive}
      onNavigationDismiss={toggleMobileNavigationActive}
      skipToContentTarget={skipToContentRef}
    >
      {contextualSaveBarMarkup}
      {loadingMarkup}
      {pageMarkup}
      {toastMarkup}
    </Frame>
  );
}

