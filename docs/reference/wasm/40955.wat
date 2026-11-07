  (func (;40955;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32 i32 i32 i32 i64 f32)
    global.get 0
    i32.const -64
    i32.add
    local.tee 3
    global.set 0
    i32.const 0
    local.set 1
    i32.const 4365077
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375560
      call 2180
      i32.const 3387092
      call 2180
      i32.const 3387096
      call 2180
      i32.const 3387108
      call 2180
      i32.const 3387112
      call 2180
      i32.const 3387116
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3365220
      call 2180
      i32.const 4365077
      i32.const 1
      i32.store8
    end
    local.get 3
    i32.const 0
    i32.store offset=60
    local.get 0
    i32.load offset=16
    local.set 4
    block  ;; label = @1
      block  ;; label = @2
        block (result i32)  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        local.get 0
                        i32.load offset=8
                        br_table 0 (;@10;) 1 (;@9;) 2 (;@8;) 3 (;@7;) 5 (;@5;) 9 (;@1;)
                      end
                      local.get 0
                      i32.const -1
                      i32.store offset=8
                      local.get 4
                      i32.const 1
                      i32.store8 offset=240
                      i32.const 3387096
                      i32.load
                      local.set 1
                      local.get 4
                      i32.load offset=248
                      local.tee 2
                      local.get 2
                      i32.load offset=16
                      i32.const 1
                      i32.add
                      i32.store offset=16
                      block  ;; label = @10
                        local.get 1
                        i32.load offset=16
                        i32.load offset=96
                        i32.load offset=100
                        call 2224
                        if  ;; label = @11
                          local.get 2
                          i32.load offset=12
                          local.set 1
                          local.get 2
                          i32.const 0
                          i32.store offset=12
                          local.get 1
                          i32.const 0
                          i32.le_s
                          br_if 1 (;@10;)
                          local.get 2
                          i32.load offset=8
                          i32.const 0
                          local.get 1
                          i32.const 0
                          call 54070
                          br 1 (;@10;)
                        end
                        local.get 2
                        i32.const 0
                        i32.store offset=12
                      end
                      i32.const 0
                      local.set 2
                      local.get 4
                      i32.const 0
                      call 44437
                      local.get 4
                      i32.const 0
                      call 44443
                      local.get 3
                      i32.const 48
                      i32.add
                      local.get 4
                      i32.load offset=16
                      i32.const 0
                      call 49468
                      local.get 0
                      local.get 3
                      i32.load offset=56
                      i32.store offset=28
                      local.get 0
                      local.get 3
                      i64.load offset=48
                      i64.store offset=20 align=4
                      br 5 (;@4;)
                    end
                    local.get 0
                    i32.const -1
                    i32.store offset=8
                    i32.const 0
                    br 5 (;@3;)
                  end
                  local.get 0
                  i32.const -1
                  i32.store offset=8
                  local.get 4
                  i32.load offset=244
                  local.set 2
                  i32.const 3360788
                  i32.load
                  local.tee 1
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 1
                    call 60460
                  end
                  local.get 2
                  i32.const 0
                  i32.const 0
                  call 48812
                  if  ;; label = @8
                    local.get 4
                    local.get 4
                    i32.const 0
                    call 44444
                    i32.const 0
                    call 48887
                    drop
                  end
                  local.get 0
                  i32.const 0
                  i32.store offset=32
                  i32.const 3365220
                  i32.load
                  call 1900
                  local.tee 2
                  f32.const 0x1.99999ap-5 (;=0.05;)
                  i32.const 0
                  call 2408
                  local.get 0
                  local.get 2
                  i32.store offset=36
                  br 1 (;@6;)
                end
                local.get 0
                i32.const -1
                i32.store offset=8
              end
              local.get 0
              i32.load offset=32
              local.get 4
              i32.load offset=248
              i32.load offset=12
              i32.lt_s
              br_if 3 (;@2;)
              i32.const 3365220
              i32.load
              call 1900
              local.tee 2
              f32.const 0x1.666666p-2 (;=0.35;)
              i32.const 0
              call 2408
              local.get 0
              i32.const 4
              i32.store offset=8
              local.get 0
              local.get 2
              i32.store offset=12
              i32.const 1
              local.set 1
              br 4 (;@1;)
            end
            local.get 0
            i32.const -1
            i32.store offset=8
            i32.const 3387096
            i32.load
            local.set 1
            local.get 4
            i32.load offset=248
            local.tee 2
            local.get 2
            i32.load offset=16
            i32.const 1
            i32.add
            i32.store offset=16
            block  ;; label = @5
              local.get 1
              i32.load offset=16
              i32.load offset=96
              i32.load offset=100
              call 2224
              if  ;; label = @6
                local.get 2
                i32.load offset=12
                local.set 1
                local.get 2
                i32.const 0
                i32.store offset=12
                local.get 1
                i32.const 0
                i32.le_s
                br_if 1 (;@5;)
                local.get 2
                i32.load offset=8
                i32.const 0
                local.get 1
                i32.const 0
                call 54070
                br 1 (;@5;)
              end
              local.get 2
              i32.const 0
              i32.store offset=12
            end
            i32.const 0
            local.set 1
            local.get 4
            i32.const 0
            i32.store8 offset=240
            br 3 (;@1;)
          end
          i32.const 1
        end
        local.set 1
        loop  ;; label = @3
          local.get 1
          i32.eqz
          if  ;; label = @4
            local.get 0
            i32.load offset=40
            i32.const 1
            i32.add
            local.set 2
            i32.const 1
            local.set 1
            br 1 (;@3;)
          end
          local.get 0
          local.get 2
          i32.store offset=40
          block  ;; label = @4
            local.get 4
            i32.load offset=252
            local.tee 1
            i32.load offset=12
            local.get 2
            i32.gt_s
            if  ;; label = @5
              i32.const 3375560
              i32.load
              local.set 5
              local.get 4
              i32.load offset=48
              local.set 6
              local.get 3
              local.get 1
              local.get 2
              i32.const 2
              i32.shl
              i32.add
              i32.load offset=16
              i32.store offset=48
              local.get 6
              local.get 3
              i32.const 48
              i32.add
              local.get 3
              i32.const 60
              i32.add
              local.get 5
              call 34286
              i32.eqz
              br_if 1 (;@4;)
              block  ;; label = @6
                local.get 3
                i32.load offset=60
                local.tee 1
                i32.load offset=12
                i32.const 1
                i32.sub
                local.tee 2
                i32.const 0
                i32.lt_s
                br_if 0 (;@6;)
                local.get 0
                i32.const 20
                i32.add
                local.set 6
                loop  ;; label = @7
                  local.get 1
                  local.get 2
                  local.get 3
                  i32.const 48
                  i32.add
                  i32.const 3387116
                  i32.load
                  call 50458
                  local.get 3
                  i32.load offset=48
                  local.set 1
                  i32.const 3360788
                  i32.load
                  local.tee 5
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 5
                    call 60460
                  end
                  block  ;; label = @8
                    local.get 1
                    i32.const 0
                    i32.const 0
                    call 48872
                    if  ;; label = @9
                      local.get 3
                      i32.load offset=60
                      local.get 2
                      i32.const 3387108
                      i32.load
                      call 50451
                      br 1 (;@8;)
                    end
                    local.get 1
                    i32.const 0
                    call 48736
                    i32.const 0
                    call 48835
                    i32.eqz
                    br_if 0 (;@8;)
                    local.get 1
                    i32.load8_u offset=96
                    br_if 0 (;@8;)
                    local.get 1
                    i32.load8_u offset=108
                    br_if 0 (;@8;)
                    local.get 4
                    i32.load offset=248
                    local.get 1
                    i32.const 3387092
                    i32.load
                    call 50463
                    local.get 1
                    i32.const 0
                    i32.const 0
                    call 44363
                    local.get 1
                    i32.load offset=32
                    local.set 5
                    i32.const 3360788
                    i32.load
                    local.tee 7
                    i32.load offset=116
                    i32.eqz
                    if  ;; label = @9
                      local.get 7
                      call 60460
                    end
                    local.get 5
                    i32.const 0
                    i32.const 0
                    call 48812
                    if  ;; label = @9
                      local.get 1
                      i32.load offset=32
                      local.set 5
                      i32.const 4377530
                      i32.load8_u
                      i32.eqz
                      if  ;; label = @10
                        i32.const 3364764
                        call 2180
                        i32.const 4377530
                        i32.const 1
                        i32.store8
                      end
                      local.get 3
                      i32.const 3364764
                      i32.load
                      i32.load offset=92
                      i64.load align=4
                      local.tee 8
                      i64.store offset=40
                      local.get 3
                      local.get 8
                      i64.store offset=16
                      local.get 5
                      local.get 3
                      i32.const 16
                      i32.add
                      i32.const 0
                      call 20369
                      local.get 1
                      i32.load offset=32
                      f32.const 0x0p+0 (;=0;)
                      i32.const 0
                      call 20371
                      local.get 1
                      i32.load offset=32
                      i32.const 0
                      i32.const 0
                      call 20385
                    end
                    local.get 3
                    local.get 6
                    i32.load offset=8
                    i32.store offset=8
                    local.get 3
                    local.get 6
                    i64.load align=4
                    i64.store
                    local.get 4
                    local.get 1
                    local.get 3
                    i32.const 0
                    call 44440
                  end
                  local.get 2
                  i32.const 1
                  i32.sub
                  local.tee 2
                  i32.const 0
                  i32.lt_s
                  br_if 1 (;@6;)
                  local.get 3
                  i32.load offset=60
                  local.set 1
                  br 0 (;@7;)
                end
                unreachable
              end
              local.get 0
              i64.const 1
              i64.store offset=8 align=4
              i32.const 1
              local.set 1
              br 4 (;@1;)
            end
            local.get 4
            f32.load offset=224
            local.set 9
            i32.const 3365220
            i32.load
            call 1900
            local.tee 2
            local.get 9
            i32.const 0
            call 2408
            local.get 0
            i32.const 2
            i32.store offset=8
            local.get 0
            local.get 2
            i32.store offset=12
            i32.const 1
            local.set 1
            br 3 (;@1;)
          end
          i32.const 0
          local.set 1
          br 0 (;@3;)
        end
        unreachable
      end
      i32.const 4
      i32.const 7
      i32.const 0
      call 48614
      local.set 1
      block  ;; label = @2
        local.get 0
        i32.load offset=32
        local.tee 2
        local.get 1
        local.get 2
        i32.add
        local.tee 5
        local.get 4
        i32.load offset=248
        local.tee 1
        i32.load offset=12
        local.tee 6
        local.get 5
        local.get 6
        i32.lt_s
        select
        local.tee 6
        i32.ge_s
        br_if 0 (;@2;)
        local.get 0
        i32.const 20
        i32.add
        local.set 7
        loop  ;; label = @3
          local.get 1
          local.get 2
          local.get 3
          i32.const 48
          i32.add
          i32.const 3387116
          i32.load
          call 50458
          local.get 3
          i32.load offset=48
          local.set 1
          i32.const 3360788
          i32.load
          local.tee 5
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 5
            call 60460
          end
          local.get 1
          i32.const 0
          i32.const 0
          call 48872
          i32.eqz
          if  ;; label = @4
            local.get 3
            local.get 7
            i32.load offset=8
            i32.store offset=32
            local.get 3
            local.get 7
            i64.load align=4
            i64.store offset=24
            local.get 4
            local.get 1
            local.get 3
            i32.const 24
            i32.add
            i32.const 0
            call 44441
          end
          local.get 2
          i32.const 1
          i32.add
          local.tee 2
          local.get 6
          i32.eq
          br_if 1 (;@2;)
          local.get 4
          i32.load offset=248
          local.set 1
          br 0 (;@3;)
        end
        unreachable
      end
      local.get 0
      local.get 6
      i32.store offset=32
      local.get 0
      i32.const 3
      i32.store offset=8
      local.get 0
      local.get 0
      i32.load offset=36
      i32.store offset=12
      i32.const 1
      local.set 1
    end
    local.get 3
    i32.const -64
    i32.sub
    global.set 0
    local.get 1)
