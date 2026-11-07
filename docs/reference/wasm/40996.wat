  (func (;40996;) (type 6) (param i32 i32 i32 i32)
    local.get 0
    local.get 2
    i32.store offset=56
    local.get 0
    local.get 1
    i32.store offset=52
    local.get 0
    i32.load offset=72
    local.tee 2
    if  ;; label = @1
      local.get 0
      local.get 2
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=72
    end
    local.get 0
    i32.load offset=76
    local.tee 2
    if  ;; label = @1
      local.get 0
      local.get 2
      i32.const 0
      call 48892
      local.get 0
      i32.const 0
      i32.store offset=76
    end
    local.get 0
    local.get 0
    call 40997
    local.get 1
    i32.const 1
    i32.le_u
    if  ;; label = @1
      i32.const 4365103
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3371548
        call 2180
        i32.const 4365103
        i32.const 1
        i32.store8
      end
      i32.const 3371548
      i32.load
      call 1900
      local.tee 1
      local.get 0
      i32.store offset=16
      local.get 1
      i32.const 0
      i32.store offset=8
      local.get 0
      local.get 0
      local.get 1
      i32.const 0
      call 48887
      i32.store offset=76
    end)
