  (func (;43177;) (type 1) (param i32 i32)
    (local i32)
    i32.const 4366539
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 4366539
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=16
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48812
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=16
      i32.const 0
      call 48706
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=16
      i32.const 0
      i32.const 0
      call 48707
    end
    local.get 0
    i32.load offset=28
    local.tee 1
    if  ;; label = @1
      local.get 0
      local.get 1
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=28
    end)
